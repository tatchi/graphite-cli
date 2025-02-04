import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';
import { rebaseInProgress } from './rebase_in_progress';

type TRebaseResult = 'REBASE_CONFLICT' | 'REBASE_DONE';
export function rebase(args: {
  onto: string;
  from: string;
  branchName: string;
  restackCommitterDateIsAuthorDate?: boolean;
}): TRebaseResult {
  gpExecSync({
    command: `git rebase ${
      args.restackCommitterDateIsAuthorDate
        ? `--committer-date-is-author-date`
        : ''
    }--onto ${q(args.onto)} ${q(args.from)} ${q(args.branchName)}`,
    options: { stdio: 'pipe' },
    onError: 'ignore',
  });
  return rebaseInProgress() ? 'REBASE_CONFLICT' : 'REBASE_DONE';
}

export function rebaseContinue(): TRebaseResult {
  gpExecSync({
    command: `GIT_EDITOR=true git rebase --continue`,
    options: { stdio: 'pipe' },
    onError: 'ignore',
  });
  return rebaseInProgress() ? 'REBASE_CONFLICT' : 'REBASE_DONE';
}

export function rebaseAbort(): void {
  gpExecSync({
    command: `git rebase --abort`,
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}

export function rebaseInteractive(args: {
  parentBranchRevision: string;
  branchName: string;
}): TRebaseResult {
  gpExecSync({
    command: `git rebase -i ${q(args.parentBranchRevision)} ${q(
      args.branchName
    )}`,
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
  return rebaseInProgress() ? 'REBASE_CONFLICT' : 'REBASE_DONE';
}
