import type { AnalysisMetrics } from "./AnalysisMetrics.type";
// import { GeneralSearchResultDto } from "./GeneralSearchResult.dto";

export type SurveyItemAnalysis = {
    // searchedResult: GeneralSearchResultDto;
    obtainedMetrics: AnalysisMetrics;
    searchedDate: Date;
}