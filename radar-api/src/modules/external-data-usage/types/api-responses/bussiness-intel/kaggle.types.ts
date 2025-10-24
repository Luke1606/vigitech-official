export interface KaggleDataset {
    id: string;
    title: string;
    owner: string;
    downloadCount?: number;
    voteCount?: number;
    kernelCount?: number;
    topics?: string[];
    lastUpdated?: string;
}
