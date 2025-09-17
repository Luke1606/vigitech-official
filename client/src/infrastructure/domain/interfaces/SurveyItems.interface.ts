import type { UUID } from "crypto";
import type { SurveyItemDto } from "../types";

export interface SurveyItemsInterface {
    findAllRecommended: () => Promise<SurveyItemDto[]>;
    findAllSubscribed: () => Promise<SurveyItemDto[]>;
    findOne: (itemId: UUID) => Promise<SurveyItemDto>;
    subscribeOne: (itemId: UUID) => Promise<void>;
    unsubscribeOne: (itemId: UUID) => Promise<void>;
    removeOne: (itemId: UUID) => Promise<void>;
    subscribeBatch: (itemIds: UUID[]) => Promise<void>;
    unsubscribeBatch: (itemIds: UUID[]) => Promise<void>;
    removeBatch: (itemIds: UUID[]) => Promise<void>;
}