import type { UUID } from 'crypto';
import type { SurveyItem } from './SurveyItem.entitiy';

export type UserItemList = {
    id: string | UUID;
    name: string;
    items: SurveyItem[];
};