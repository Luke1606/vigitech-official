import type { Trending, AccesibilityLevel } from "../enums";

export type AnalysisMetrics = {
    citations: number;
    downloads: number;
    relevance: number;
    accesibilityLevel: AccesibilityLevel;
    trending: Trending;
}