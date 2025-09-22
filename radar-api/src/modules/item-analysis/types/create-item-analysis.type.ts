import { GeneralSearchResult, Metrics } from '@prisma/client';

export type CreateItemAnalysisType = {
    dataId: string;
    searchedData: GeneralSearchResult;

    metricsId: string;
    analyzedMetrics: Metrics;

    itemId: string;
};
