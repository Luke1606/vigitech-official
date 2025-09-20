import { SurveyItem, SubscribedItemAnalysis } from '@prisma/client';
import { SurveyItemBasicData } from './survey-item-basic-data.type';

export type SurveyItemWithAnalysis = {
    item: SurveyItem | SurveyItemBasicData;
    lastAnalysis: SubscribedItemAnalysis;
};
