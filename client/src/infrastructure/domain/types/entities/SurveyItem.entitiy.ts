import type { UUID } from "crypto";
import type { RadarQuadrant, RadarRing } from "../../enums";
import { type SurveyItemAnalysis } from "../SurveyItemAnalysis.type";

export type SurveyItem = {
    id: UUID;
    title: string;
    summary?: string;
    radarQuadrant: RadarQuadrant;
    radarRing: RadarRing;
    lastAnalysis?: SurveyItemAnalysis;
}