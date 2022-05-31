import { TContext } from './context';
import { PreconditionsFailedError } from './errors';
import { branchExists } from './git/branch_exists';
import { detectStagedChanges } from './git/detect_staged_changes';
import {
  trackedUncommittedChanges,
  unstagedChanges,
} from './git/git_status_utils';
import { gpExecSync } from './utils/exec_sync';

export function getRepoRootPathPrecondition(): string {
  const repoRootPath = gpExecSync({
    command: `git rev-parse --git-common-dir`,
  });
  if (!repoRootPath || repoRootPath.length === 0) {
    throw new PreconditionsFailedError('No .git repository found.');
  }
  return repoRootPath;
}

function branchExistsPrecondition(branchName: string): void {
  if (!branchExists(branchName)) {
    throw new PreconditionsFailedError(
      `Cannot find branch named: (${branchName}).`
    );
  }
}

function uncommittedTrackedChangesPrecondition(): void {
  if (trackedUncommittedChanges()) {
    throw new PreconditionsFailedError(
      `There are tracked changes that have not been committed. Please resolve and then retry.`
    );
  }
}

function ensureSomeStagedChangesPrecondition(context: TContext): void {
  if (detectStagedChanges()) {
    return;
  }

  if (unstagedChanges()) {
    context.splog.logTip(
      'There are unstaged changes. Use -a option to stage all unstaged changes.'
    );
  }

  throw new PreconditionsFailedError(`Cannot run without staged changes.`);
}

function cliAuthPrecondition(context: TContext): string {
  const token = context.userConfig.data.authToken;
  if (!token || token.length === 0) {
    throw new PreconditionsFailedError(
      'Please authenticate your Graphite CLI by visiting https://app.graphite.dev/activate.'
    );
  }
  return token;
}

function currentGitRepoPrecondition(): string {
  const repoRootPath = gpExecSync({
    command: `git rev-parse --show-toplevel`,
  });
  if (!repoRootPath || repoRootPath.length === 0) {
    throw new PreconditionsFailedError('No .git repository found.');
  }
  return repoRootPath;
}

export {
  branchExistsPrecondition,
  uncommittedTrackedChangesPrecondition,
  currentGitRepoPrecondition,
  ensureSomeStagedChangesPrecondition,
  cliAuthPrecondition,
};
