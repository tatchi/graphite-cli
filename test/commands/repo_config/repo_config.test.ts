import { expect } from 'chai';
import fs from 'fs-extra';
import path from 'path';
import { getOwnerAndNameFromURL } from '../../../src/lib/spiffy/repo_config_spf';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): infer repo owner/name`, function () {
    configureTest(this, scene);

    it('Can infer cloned repos', () => {
      const { owner, name } = getOwnerAndNameFromURL(
        'https://github.com/withgraphite/graphite-cli.git'
      );
      expect(owner === 'withgraphite').to.be.true;
      expect(name === 'graphite-cli').to.be.true;
    });

    it('Can infer SSH cloned repos', () => {
      const { owner, name } = getOwnerAndNameFromURL(
        'git@github.com:withgraphite/graphite-cli.git'
      );
      expect(owner === 'withgraphite').to.be.true;
      expect(name === 'graphite-cli').to.be.true;
    });

    it('Can infer SSH cloned repos (with git@ configured separately)', () => {
      const { owner, name } = getOwnerAndNameFromURL(
        'github.com/withgraphite/graphite-cli.git'
      );
      expect(owner === 'withgraphite').to.be.true;
      expect(name === 'graphite-cli').to.be.true;
    });

    it('Can read the existing repo config when executing from a subfolder in the project', () => {
      expect(() => scene.repo.execCliCommand(`ls`)).to.not.throw(Error);
      const subDir = path.join(scene.dir, 'tmpDir');
      fs.mkdirSync(subDir);
      expect(() =>
        scene.repo.execCliCommand(`ls`, { cwd: subDir })
      ).to.not.throw(Error);
    });

    // Not sure where these are coming from but we should be able to handle
    // them.
    it('Can infer cloned repos without .git', () => {
      const clone = getOwnerAndNameFromURL(
        'https://github.com/withgraphite/graphite-cli'
      );
      expect(clone.owner === 'withgraphite').to.be.true;
      expect(clone.name === 'graphite-cli').to.be.true;

      const sshClone = getOwnerAndNameFromURL(
        'git@github.com:withgraphite/graphite-cli'
      );
      expect(sshClone.owner === 'withgraphite').to.be.true;
      expect(sshClone.name === 'graphite-cli').to.be.true;
    });
  });
}
