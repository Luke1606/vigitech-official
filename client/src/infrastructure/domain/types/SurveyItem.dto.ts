import type { UUID } from "crypto";
import type { RadarQuadrant, RadarRing } from "../enums";
import { type SurveyItemAnalysisDto } from "./SurveyItemAnalysis.dto";

export type SurveyItemDto = {
    id: UUID;
    title: string;
    summary: string;
    radarQuadrant: RadarQuadrant;
    radarRing: RadarRing;
    lastAnalysis: SurveyItemAnalysisDto;
}