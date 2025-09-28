import type { UUID } from "crypto";
import type { SurveyItem } from "../types";

export interface SurveyItemsInterface {
    findAllRecommended: () => Promise<SurveyItem[]>;
    findAllSubscribed: () => Promise<SurveyItem[]>;
    findOne: (itemId: UUID) => Promise<SurveyItem>;
    subscribeOne: (itemId: UUID) => Promise<void>;
    unsubscribeOne: (itemId: UUID) => Promise<void>;
    removeOne: (itemId: UUID) => Promise<void>;
    subscribeBatch: (itemIds: UUID[]) => Promise<void>;
    unsubscribeBatch: (itemIds: UUID[]) => Promise<void>;
    removeBatch: (itemIds: UUID[]) => Promise<void>;
}