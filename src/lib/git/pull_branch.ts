import { q } from '../utils/escape_for_shell';
import { gpExecSync } from '../utils/exec_sync';

export function pullBranch(remote: string, branchName: string): void {
  gpExecSync({
    command: `git pull --ff-only ${q(remote)} ${q(branchName)}`,
    options: { stdio: 'pipe' },
    onError: 'throw',
  });
}
