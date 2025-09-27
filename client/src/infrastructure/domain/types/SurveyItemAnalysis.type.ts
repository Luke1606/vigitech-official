import type { AnalysisMetricsDto } from "./AnalysisMetrics.type";
// import { GeneralSearchResultDto } from "./GeneralSearchResult.dto";

export type SurveyItemAnalysisDto = {
    // searchedResult: GeneralSearchResultDto;
    obtainedMetrics: AnalysisMetricsDto;
    searchedDate: Date;
}