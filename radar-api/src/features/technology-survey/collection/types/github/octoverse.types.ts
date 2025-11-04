export type OctoverseReport = {
    year: number;
    title: string;
    summary: string;
    trends: OctoverseTrend[];
    topLanguages: OctoverseLanguageStat[];
    topTechnologies: OctoverseTechnologyStat[];
    // Add other relevant fields as per actual Octoverse report structure
};

export type OctoverseTrend = {
    name: string;
    description: string;
    growthPercentage: number;
    relatedTechnologies: string[];
};

export type OctoverseLanguageStat = {
    language: string;
    rank: number;
    growth: number; // e.g., percentage change
};

export type OctoverseTechnologyStat = {
    technology: string;
    category: string;
    mentions: number;
    adoptionRate: number; // e.g., percentage of developers using it
};
