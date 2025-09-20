import { GeneralSearchResponse } from './general-search-response.type';
import { Metrics } from './analysis-metrics.type';

export type CreateItemAnalysis = {
    searchedData: GeneralSearchResponse;
    analyzedMetrics: Metrics;
    itemId: string;
};
