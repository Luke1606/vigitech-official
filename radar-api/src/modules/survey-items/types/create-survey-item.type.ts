/* eslint-disable prettier/prettier */
import { RadarQuadrant } from '@prisma/client';

export type CreateSurveyItemType = {
    title: string;
    summary: string;
    radarQuadrant: RadarQuadrant;
}
