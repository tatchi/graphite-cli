import tmp from 'tmp';
import yargs from 'yargs';
import { graphiteWithoutRepo } from '../lib/runner';
import { gpExecSync } from '../lib/utils/exec_sync';
import { GitRepo } from '../lib/utils/git_repo';
import { makeId } from '../lib/utils/make_id';

export const command = 'demo';
export const canonical = 'demo';
export const description = false;

const args = {} as const;
export const builder = args;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return graphiteWithoutRepo(argv, canonical, async (context) => {
    const tmpDir = tmp.dirSync();
    context.splog.info(tmpDir.name);
    const repo = new GitRepo(tmpDir.name);

    const id = makeId(4);

    repo.createChangeAndCommit('First commit');
    repo.createChangeAndCommit('Second commit');

    repo.createChange('[Product] Add review queue filter api');
    execCliCommand(
      `branch create 'tr-${id}--review_queue_api' -m '[Product] Add review queue filter api'`,
      { fromDir: tmpDir.name }
    );

    repo.createChange('[Product] Add review queue filter server');
    execCliCommand(
      `branch create 'tr-${id}--review_queue_server' -m '[Product] Add review queue filter server'`,
      { fromDir: tmpDir.name }
    );

    repo.createChange('[Product] Add review queue filter frontend');
    execCliCommand(
      `branch create 'tr-${id}--review_queue_frontend' -m '[Product] Add review queue filter frontend'`,
      { fromDir: tmpDir.name }
    );

    repo.checkoutBranch('main');

    repo.createChange('[Bug Fix] Fix crashes on reload');
    execCliCommand(
      `branch create 'tr-${id}--fix_crash_on_reload' -m '[Bug Fix] Fix crashes on reload'`,
      { fromDir: tmpDir.name }
    );

    repo.checkoutBranch('main');

    repo.createChange('[Bug Fix] Account for empty state');
    execCliCommand(
      `branch create 'tr-${id}--account_for_empty_state' -m '[Bug Fix] Account for empty state'`,
      { fromDir: tmpDir.name }
    );

    repo.checkoutBranch('main');

    gpExecSync({
      command:
        'git remote add origin git@github.com:withgraphite/graphite-demo-repo.git',
      options: { cwd: tmpDir.name },
      onError: 'throw',
    });
    gpExecSync({
      command: 'git push origin main -f',
      options: { cwd: tmpDir.name },
      onError: 'throw',
    });
  });
};

function execCliCommand(command: string, opts: { fromDir: string }) {
  gpExecSync({
    command: `gt ${command}`,
    options: {
      stdio: 'inherit',
      cwd: opts.fromDir,
    },
    onError: 'throw',
  });
}
