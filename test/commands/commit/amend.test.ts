import { expect } from 'chai';
import { allScenes } from '../../lib/scenes/all_scenes';
import { configureTest } from '../../lib/utils/configure_test';
import { expectCommits } from '../../lib/utils/expect_commits';

for (const scene of allScenes) {
  describe(`(${scene}): commit amend`, function () {
    configureTest(this, scene);

    it('Can amend a commit', () => {
      scene.repo.createChange('2');
      scene.repo.execCliCommand(`branch create -m "2" -q`);
      expectCommits(scene.repo, '2, 1');

      scene.repo.execCliCommand(`commit amend -m "3" -q`);
      expectCommits(scene.repo, '3, 1');
    });

    it('Can amend if there are no staged changes', () => {
      scene.repo.createChange('2');
      scene.repo.execCliCommand(`branch create -m "2" -q`);
      scene.repo.execCliCommand(`commit amend -m "a" -q`);
      expectCommits(scene.repo, 'a, 1');
    });

    it('Automatically restacks upwards', () => {
      scene.repo.createChange('2', '2');
      scene.repo.execCliCommand(`branch create a -m "2" -q`);

      scene.repo.createChange('3', '3');
      scene.repo.execCliCommand(`branch create b -m "3" -q`);

      scene.repo.checkoutBranch('a');
      scene.repo.execCliCommand(`commit amend -m "2.5" -q`);

      scene.repo.checkoutBranch('b');
      expectCommits(scene.repo, '3, 2.5, 1');
    });

    it('Restacks correctly when there are merge conflicts', () => {
      const lorem =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

      scene.repo.createChange(lorem);
      scene.repo.execCliCommand(`branch create a -m "a" -q`);

      scene.repo.createChange(['b', lorem].join('\n'));
      scene.repo.execCliCommand(`branch create b -m "b" -q`);

      scene.repo.checkoutBranch('a');
      scene.repo.createChange(`Hello world! ${lorem}`);
      expect(() =>
        scene.repo.execCliCommand(`commit amend -m "a1" -q`)
      ).to.throw();
      expect(scene.repo.rebaseInProgress()).to.be.true;

      scene.repo.resolveMergeConflicts();
      scene.repo.markMergeConflictsAsResolved();
      scene.repo.execCliCommand(`continue -q`);

      scene.repo.checkoutBranch('b');

      // Notably, the old commit that became a1 should *not* be in this list;
      // Graphite should have associated that a became a1 and made sure that
      // as we upstacked branch 'b' that commit 'a' was dropped.
      expectCommits(scene.repo, 'b, a1, 1');
    });

    it('Can amend a commit with a multi-word commit message', () => {
      scene.repo.createChange('2');
      scene.repo.execCliCommand(`branch create -m "2" -q`);
      scene.repo.execCliCommand(`commit amend -m "a b c" -q`);
      expectCommits(scene.repo, 'a b c');
    });
  });
}
