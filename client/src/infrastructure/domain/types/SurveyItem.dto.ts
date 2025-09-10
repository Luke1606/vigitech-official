import { RadarQuadrant, RadarRing } from "../enum/SurveyItemsOptions.enum";
import { SurveyItemAnalysisDto } from "./SurveyItemAnalysis.dto";

export type SurveyItemDto = {
    id: string;
    title: string;
    summary: string;
    radarQuadrant: RadarQuadrant;
    radarRing: RadarRing;
    lastAnalysis: SurveyItemAnalysisDto;
}