import type { UUID } from "crypto";
import type { RadarQuadrant, RadarRing } from "../../enums";

export type InsightsValues = {
    citedFragmentIds: UUID[];
    insight: string;
    reasoningMetrics: any;
};

export type SurveyItem = {
    createdAt: string;
    id: UUID;
    insertedById: string | null;
    itemField: RadarQuadrant;
    latestClassification: {
        id: UUID;
        analyzedAt: string;
        itemId: string;
        classification: RadarRing;
        insightsValues: InsightsValues;
    };
    latestClassificationId: UUID;
    summary: string;
    title: string;
    updatedAt: string;
};