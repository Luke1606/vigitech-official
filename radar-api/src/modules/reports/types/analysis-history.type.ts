import { ItemAnalysis, SurveyItem } from '@prisma/client';

export type AnalysisHistoryType = {
    item: SurveyItem;
    analysises: ItemAnalysis[];
};
