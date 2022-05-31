"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const clean_branches_1 = require("../actions/clean_branches");
const edit_downstack_1 = require("../actions/edit/edit_downstack");
const fix_1 = require("../actions/fix");
const stack_onto_1 = require("../actions/onto/stack_onto");
const sync_1 = require("../actions/sync/sync");
const errors_1 = require("../lib/errors");
const add_all_1 = require("../lib/git/add_all");
const rebase_in_progress_1 = require("../lib/git/rebase_in_progress");
const profile_1 = require("../lib/telemetry/profile");
const assert_unreachable_1 = require("../lib/utils/assert_unreachable");
const exec_sync_1 = require("../lib/utils/exec_sync");
const branch_1 = require("../wrapper-classes/branch");
const fix_2 = require("./repo-commands/fix");
const args = {
    all: {
        describe: `Stage all changes before continuing.`,
        demandOption: false,
        default: false,
        type: 'boolean',
        alias: 'a',
    },
    edit: {
        describe: `Modify the existing commit message for an amended, resolved merge conflict.`,
        demandOption: false,
        default: true,
        type: 'boolean',
    },
    'no-edit': {
        type: 'boolean',
        describe: "Don't modify the existing commit message. Takes precedence over --edit",
        demandOption: false,
        default: false,
        alias: 'n',
    },
};
exports.command = 'continue';
exports.canonical = 'continue';
exports.aliases = [];
exports.description = 'Continues the most-recent Graphite command halted by a merge conflict.';
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const pendingRebase = rebase_in_progress_1.rebaseInProgress();
        const mostRecentCheckpoint = (_a = context.mergeConflictCallstackConfig) === null || _a === void 0 ? void 0 : _a.data.callstack;
        if (!mostRecentCheckpoint && !pendingRebase) {
            throw new errors_1.PreconditionsFailedError(`No Graphite command to continue.`);
        }
        if (argv.all) {
            add_all_1.addAll();
        }
        const edit = !argv['no-edit'] && argv.edit;
        if (pendingRebase) {
            exec_sync_1.gpExecSync({
                command: `${edit ? '' : 'GIT_EDITOR=true'} git rebase --continue`,
                options: {
                    stdio: 'inherit',
                },
            });
        }
        if (mostRecentCheckpoint) {
            yield resolveCallstack(mostRecentCheckpoint, context);
            (_b = context.mergeConflictCallstackConfig) === null || _b === void 0 ? void 0 : _b.delete();
        }
    }));
});
exports.handler = handler;
function resolveCallstack(callstack, context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (callstack.length === 0) {
            return;
        }
        const frame = callstack[0];
        const remaining = callstack.slice(1);
        switch (frame.op) {
            case 'STACK_ONTO_BASE_REBASE_CONTINUATION':
                stack_onto_1.stackOntoBaseRebaseContinuation(frame, remaining, context);
                break;
            case 'STACK_ONTO_FIX_CONTINUATION':
                stack_onto_1.stackOntoFixContinuation(frame, context);
                break;
            case 'STACK_FIX': {
                const branch = branch_1.Branch.branchWithName(frame.sourceBranchName);
                fix_1.restackBranch({
                    branch: branch,
                    mergeConflictCallstack: remaining,
                }, context);
                break;
            }
            case 'STACK_FIX_ACTION_CONTINUATION':
                fix_1.stackFixActionContinuation(frame);
                break;
            case 'DELETE_BRANCHES_CONTINUATION':
                yield clean_branches_1.cleanBranches({
                    frame: frame,
                    parent: remaining,
                }, context);
                break;
            case 'REPO_FIX_BRANCH_COUNT_SANTIY_CHECK_CONTINUATION':
                fix_2.deleteMergedBranchesContinuation(context);
                break;
            case 'REPO_SYNC_CONTINUATION':
                yield sync_1.cleanBranchesContinuation(frame, context);
                break;
            case 'STACK_EDIT_CONTINUATION':
                edit_downstack_1.applyStackEdits(frame.currentBranchName, frame.remainingEdits, context);
                break;
            default:
                assert_unreachable_1.assertUnreachable(frame);
        }
        yield resolveCallstack(remaining, context);
    });
}
//# sourceMappingURL=continue.js.map