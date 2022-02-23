export declare const repoConfigFactory: {
    load: (configPath?: string | undefined) => {
        readonly data: {
            owner: string | undefined;
            name: string | undefined;
            trunk: string | undefined;
            ignoreBranches: string[] | undefined;
            maxStacksShownBehindTrunk: number | undefined;
            maxDaysShownBehindTrunk: number | undefined;
            maxBranchLength: number | undefined;
            lastFetchedPRInfoMs: number | undefined;
        };
        readonly update: (mutator: (data: {
            owner: string | undefined;
            name: string | undefined;
            trunk: string | undefined;
            ignoreBranches: string[] | undefined;
            maxStacksShownBehindTrunk: number | undefined;
            maxDaysShownBehindTrunk: number | undefined;
            maxBranchLength: number | undefined;
            lastFetchedPRInfoMs: number | undefined;
        }) => void) => void;
        readonly path: string;
    } & {
        readonly getIgnoreBranches: () => string[];
        readonly getMaxBranchLength: () => number;
        readonly setTrunk: (trunk: string) => void;
        readonly branchIsIgnored: (branchName: string) => boolean;
        readonly graphiteInitialized: () => boolean;
        readonly getMaxDaysShownBehindTrunk: () => number;
        readonly getMaxStacksShownBehindTrunk: () => number;
        readonly getRepoOwner: () => string;
        readonly addIgnoreBranchPatterns: (ignoreBranches: string[]) => void;
        readonly removeIgnoreBranches: (branchPatternToRemove: string) => void;
        readonly getRepoName: () => string;
    };
};
export declare function getOwnerAndNameFromURLForTesting(originURL: string): {
    owner: string | undefined;
    name: string | undefined;
};
