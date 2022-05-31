"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranch = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function deleteBranch(branchName) {
    exec_sync_1.gpExecSync({
        command: `git branch -qD ${branchName}`,
    });
}
exports.deleteBranch = deleteBranch;
//# sourceMappingURL=deleteBranch.js.map