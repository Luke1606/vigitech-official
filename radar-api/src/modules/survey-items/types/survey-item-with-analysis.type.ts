import { SurveyItem, SubscribedItemAnalysis } from '@prisma/client';
import { CreateSurveyItemType } from './create-survey-item.type';
import { CreateItemAnalysisType } from 'src/modules/item-analysis/types/create-item-analysis.type';

export type SurveyItemWithAnalysisType = {
    item: SurveyItem | CreateSurveyItemType;
    lastAnalysis: SubscribedItemAnalysis | CreateItemAnalysisType;
};
