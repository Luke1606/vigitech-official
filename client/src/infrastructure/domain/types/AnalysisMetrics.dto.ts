import { Trending, AccesibilityLevel } from "../enum";

export type AnalysisMetricsDto = {
    citations: number;
    downloads: number;
    relevance: number;
    accesibilityLevel: AccesibilityLevel;
    trending: Trending;
}