import { RadarQuadrant } from '@prisma/client';
import { ExternalReferences } from '../../../../shared/types/external-references.type'; // Import new type

/**
 * Define el tipo de datos para crear un nuevo SurveyItem.
 * Incluye los campos básicos y las referencias a sistemas externos.
 */
export type CreateSurveyItemType = {
    title: string;
    summary: string;
    radarQuadrant: RadarQuadrant;
    externalReferences: ExternalReferences;
};
