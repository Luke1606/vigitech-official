import type { Trending, AccesibilityLevel } from "../enums";

export type AnalysisMetricsDto = {
    citations: number;
    downloads: number;
    relevance: number;
    accesibilityLevel: AccesibilityLevel;
    trending: Trending;
}