import { AnalysisMetricsDto } from "./AnalysisMetrics.dto";
import { GeneralSearchResultDto } from "./GeneralSearchResult.dto";

export type SurveyItemAnalysisDto = {
    searchedResult: GeneralSearchResultDto;
    obtainedMetrics: AnalysisMetricsDto;
    searchedDate: Date;
}