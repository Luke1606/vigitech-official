export type KaggleDataset = {
    id: number;
    ref: string;
    title: string;
    url: string;
    downloadCount: number;
    lastUpdated: string;
    licenseName: string;
};

export type KaggleCompetition = {
    id: number;
    ref: string;
    title: string;
    description: string;
    tags: string[];
    reward: number;
    deadline: string;
    submissionsCount: number;
    teamCount: number;
    url: string;
};
