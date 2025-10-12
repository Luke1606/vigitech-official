import { type SurveyItem, RadarQuadrant, RadarRing, type SurveyItemAnalysis } from "@/infrastructure";
import type { UUID } from "crypto";

export const availableItems: SurveyItem[] = [
    {
        id: '1' as UUID,
        title: 'React',
        summary: 'Biblioteca declarativa para construir interfaces de usuario.',
        radarQuadrant: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
        radarRing: RadarRing.ADOPT,
        lastAnalysis: {} as unknown as SurveyItemAnalysis
    },
    {
        id: '2' as UUID,
        title: 'TypeScript',
        summary: 'Superset de JavaScript que añade tipado estático.',
        radarQuadrant: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
        radarRing: RadarRing.ADOPT,
        lastAnalysis: {} as unknown as SurveyItemAnalysis
    },
    {
        id: '3' as UUID,
        title: 'Tailwind CSS',
        summary: 'Framework de utilidades para estilos rápidos y consistentes.',
        radarQuadrant: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
        radarRing: RadarRing.SUSTAIN,
        lastAnalysis: {} as unknown as SurveyItemAnalysis
    },
    {
        id: '4' as UUID,
        title: 'Vite',
        summary: 'Bundler moderno para desarrollo frontend rápido.',
        radarQuadrant: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
        radarRing: RadarRing.ADOPT,
        lastAnalysis: {} as unknown as SurveyItemAnalysis
    },
    {
        id: '5' as UUID,
        title: 'Zod',
        summary: 'Validador de esquemas TypeScript con inferencia de tipos.',
        radarQuadrant: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
        radarRing: RadarRing.TEST,
        lastAnalysis: {} as unknown as SurveyItemAnalysis
    }
];