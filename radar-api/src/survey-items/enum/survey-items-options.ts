import { RadarQuadrant, RadarRing } from '@prisma/client';

export const SurveyItemRadarQuadrant = [
  RadarQuadrant.BUSSINESS_INTEL,
  RadarQuadrant.SCIENTIFIC_STAGE,
  RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
  RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
  RadarQuadrant.UNKNOWN,
];

export const SurveyItemRadarRing = [
  RadarRing.ADOPT,
  RadarRing.TEST,
  RadarRing.SUSTAIN,
  RadarRing.HOLD,
  RadarRing.UNKNOWN,
];
