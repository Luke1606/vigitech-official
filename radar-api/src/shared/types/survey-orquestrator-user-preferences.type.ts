import { UserPreferences } from '@prisma/client';

export type SurveyOrchestratorUserPreferences = Pick<
    UserPreferences,
    'userId' | 'reClasificationFrequency' | 'recommendationsUpdateFrequency'
>;
