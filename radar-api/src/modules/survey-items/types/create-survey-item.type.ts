import { RadarQuadrant, RadarRing } from '@prisma/client';

export type CreateSurveyItemType = {
    title: string;
    summary: string;
    radarQuadrant: RadarQuadrant;
};
