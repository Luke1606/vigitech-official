import { Trending, AccesibilityLevel } from '../enum/item-analysis-options';

export type Metrics = {
    citations: number;
    downloads: number;
    relevance: number;
    accesibilityLevel: AccesibilityLevel;
    trending: Trending;
};
