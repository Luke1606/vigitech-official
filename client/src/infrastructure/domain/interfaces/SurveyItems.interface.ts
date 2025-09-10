import type { UUID } from "crypto";
import { SurveyItemDto } from "../types";

export interface SurveyItemsInterface {
    findAllRecommendations: () => Promise<SurveyItemDto[]>;
    findAllSubscribed: () => Promise<SurveyItemDto[]>;
    findOne: (itemId: UUID) => Promise<SurveyItemDto>;
    subscribe: (itemId: UUID) => Promise<void>;
    unsubscribe: (itemId: UUID) => Promise<void>;
    remove: (itemId: UUID) => Promise<void>;
}