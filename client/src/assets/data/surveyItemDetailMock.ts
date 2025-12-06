import { UUID } from "crypto";
import { SurveyItem, RadarQuadrant, RadarRing, AccesibilityLevel, Trending } from "../../infrastructure";

export const exampleSurveyItem: SurveyItem = {
    id: '550e8400-e29b-41d4-a716-446655440000' as UUID, // UUID en formato string
    title: 'Machine Learning en Análisis Predictivo',
    summary: 'Implementación de modelos de ML para predecir tendencias del mercado',
    radarQuadrant: RadarQuadrant.BUSSINESS_INTEL,
    radarRing: RadarRing.ADOPT,
    lastAnalysis: {
        obtainedMetrics: {
            citations: 150,
            downloads: 5000,
            relevance: 8,
            accesibilityLevel: AccesibilityLevel.FREE,
            trending: Trending.UP
        },
        searchedDate: new Date('2024-01-15')
    }
};