import { UserPreferences } from '@prisma/client';

/**
 * Subconjunto de preferencias de usuario relevantes para el orquestador.
 * Incluye solo las propiedades necesarias para la funcionalidad del orquestador.
 */
export type SurveyOrchestratorUserPreferences = Pick<
    UserPreferences,
    'userId' | 'reClasificationFrequency' | 'recommendationsUpdateFrequency'
>;
