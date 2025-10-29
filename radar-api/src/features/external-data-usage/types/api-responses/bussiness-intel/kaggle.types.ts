export interface KaggleUser {
    id: string;
    userName: string;
    displayName: string;
    organization?: string; // Could indicate a company
    followersCount?: number;
    competitionsCount?: number;
    datasetsCount?: number;
    notebooksCount?: number;
}

export interface KaggleDataset {
    id: string;
    ref: string; // e.g., 'owner/dataset-name'
    title: string;
    subtitle?: string;
    description?: string;
    ownerRef: string; // Reference to KaggleUser
    creator?: KaggleUser; // Detailed creator info
    url: string;
    totalBytes?: number;
    fileCount?: number;
    downloadCount?: number;
    viewCount?: number;
    voteCount?: number;
    kernelCount?: number; // Number of notebooks/scripts using this dataset
    topics?: string[];
    tags?: string[];
    lastUpdated?: string;
    licenseName?: string;
    isPrivate?: boolean;
    usabilityRating?: number; // 0-1 score
}

export interface KaggleCompetition {
    id: string;
    ref: string; // e.g., 'competition-name'
    title: string;
    subtitle?: string;
    description?: string;
    url: string;
    awardSize?: string; // e.g., '$10,000'
    teamCount?: number;
    participantCount?: number;
    kernelCount?: number;
    voteCount?: number;
    tags?: string[];
    hostSegment?: 'featured' | 'research' | 'recruitment' | 'playground';
    organizationName?: string; // Sponsoring organization
    category?: 'inClass' | 'playground' | 'research' | 'featured' | 'recruitment';
    dateEnabled?: string;
    dateEnded?: string;
    lastUpdated?: string;
}

export interface KaggleNotebook {
    id: string;
    ref: string; // e.g., 'owner/notebook-name'
    title: string;
    subtitle?: string;
    text?: string; // Description or summary
    url: string;
    ownerRef: string; // Reference to KaggleUser
    creator?: KaggleUser; // Detailed creator info
    datasetRefs?: string[]; // References to datasets used
    competitionRefs?: string[]; // References to competitions
    forkCount?: number;
    commentCount?: number;
    voteCount?: number;
    viewCount?: number;
    language?: string; // e.g., 'python', 'r'
    lastUpdated?: string;
    isPrivate?: boolean;
}

export interface KaggleApiResponse {
    datasets?: KaggleDataset[];
    competitions?: KaggleCompetition[];
    notebooks?: KaggleNotebook[];
    users?: KaggleUser[];
    // Potentially other aggregated metrics or search results
}
