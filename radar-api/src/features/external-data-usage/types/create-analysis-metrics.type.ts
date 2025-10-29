import { AccesibilityLevel, Trending } from '@prisma/client';

export type CreateMetricsType = {
    citations: number;
    downloads: number;
    relevance: number;
    accesibilityLevel: AccesibilityLevel;
    trending: Trending;
};
