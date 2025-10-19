import type { UUID } from "crypto";
import type { SurveyItem } from "./SurveyItem.type";

export type UserItemList = {
    id: UUID;
    name: string;
    items: SurveyItem[];
};