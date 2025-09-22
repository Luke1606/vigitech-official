import { RadarQuadrant } from '@prisma/client';

export type CreateSurveyItemType = {
    title: string;
    summary: string;
    source: string;
    radarQuadrant: RadarQuadrant;
}
