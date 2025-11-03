import { SurveyItem, ItemAnalysis } from '@prisma/client';

export type SurveyItemWithAnalysisType = {
    item: SurveyItem;
    lastAnalysis: ItemAnalysis;
};
