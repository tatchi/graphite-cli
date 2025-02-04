import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { inferPRBody } from '../../src/actions/submit/pr_body';
import { getPRTitle } from '../../src/actions/submit/pr_title';
import { validateNoEmptyBranches } from '../../src/actions/submit/validate_branches';
import { BasicScene } from '../lib/scenes/basic_scene';
import { configureTest } from '../lib/utils/configure_test';

use(chaiAsPromised);

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): correctly infers submit info from commits`, function () {
    configureTest(this, scene);

    it('can infer title/body from single commit', async () => {
      const title = 'Test Title';
      const body = ['Test body line 1.', 'Test body line 2.'].join('\n');
      const message = `${title}\n\n${body}`;

      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "${message}" -q`);

      expect(
        await getPRTitle({ branchName: 'a' }, scene.getContext())
      ).to.equals(title);
      expect(
        inferPRBody(
          { branchName: 'a', template: 'template' },
          scene.getContext()
        ).body
      ).to.equals(`${body}\n\ntemplate`);
    });

    it('can infer just title with no body', async () => {
      const title = 'Test Title';
      const commitMessage = title;

      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "${commitMessage}" -q`);

      expect(
        await getPRTitle({ branchName: 'a' }, scene.getContext())
      ).to.equals(title);
      expect(
        inferPRBody(
          { branchName: 'a', template: 'template' },
          scene.getContext()
        ).body
      ).to.equal('template');
    });

    it('can infer title/body from multiple commits', async () => {
      const title = 'Test Title';
      const secondSubj = 'Second commit subject';

      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "${title}" -q`);
      scene.repo.createChangeAndCommit(secondSubj);

      expect(
        await getPRTitle({ branchName: 'a' }, scene.getContext())
      ).to.equals(title);
      expect(
        inferPRBody({ branchName: 'a' }, scene.getContext()).body
      ).to.equal(`## ${title}\n\n## ${secondSubj}`);
    });

    it('aborts if the branch is empty', async () => {
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      await expect(validateNoEmptyBranches(['a'], scene.getContext())).to.be
        .rejected;
    });

    it('does not abort if the branch is not empty', async () => {
      scene.repo.createChange('a');
      scene.repo.execCliCommand(`branch create "a" -m "a" -q`);
      await expect(validateNoEmptyBranches(['a'], scene.getContext())).to.be
        .fulfilled;
    });
  });
}
