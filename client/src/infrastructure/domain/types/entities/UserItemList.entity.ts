import type { UUID } from 'crypto';
import type { SurveyItem } from './SurveyItem.entitiy';
import { Blip } from '../Blip.type';

export type UserItemList = {
    id: UUID;
    name: string;
    items: SurveyItem[] | Blip[];
};