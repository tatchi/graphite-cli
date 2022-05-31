import { TRepoSyncStackFrame } from '../../lib/config/merge_conflict_callstack_config';
import { TContext } from '../../lib/context';
export declare function syncAction(opts: {
    pull: boolean;
    force: boolean;
    delete: boolean;
    showDeleteProgress: boolean;
    resubmit: boolean;
    fixDanglingBranches: boolean;
    downstackToSync?: string[];
}, context: TContext): Promise<void>;
export declare function cleanBranchesContinuation(frame: TRepoSyncStackFrame, context: TContext): Promise<void>;
/**
 *
 * Remove for now - users are reporting issues where this is incorrectly
 * deleting metadata for still-existing branches.
 *
 * https://graphite-community.slack.com/archives/C02DRNRA9RA/p1632897956089100
 * https://graphite-community.slack.com/archives/C02DRNRA9RA/p1634168133170500
 *
function cleanDanglingMetadata(): void {
  const allMetadataRefs = MetadataRef.allMetadataRefs();
  allMetadataRefs.forEach((ref) => {
    if (!branchExists(ref._branchName)) {
      context.splog.logDebug(`Deleting metadata for ${ref._branchName}`);
      ref.delete();
    }
  });
}
*/
