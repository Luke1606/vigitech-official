import { SubscribedItemAnalysis, SurveyItem } from '@prisma/client';

export type AnalysisHistoryType = {
    item: SurveyItem;
    analysises: SubscribedItemAnalysis[];
};
