/**
 * Módulo principal que orquesta la integración de todos los módulos de la aplicación.
 * @module ModulesModule
 */
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserDataModule } from './user-data/user-data.module';
import { TechnologySurveyModule } from './technology-survey/technology-survey.module';
import { AiAgentsModule } from './ai-agents/ai-agents.module';
import { DataHubModule } from './data-hub/data-hub.module';

@Module({
    imports: [AuthModule, AiAgentsModule, DataHubModule, TechnologySurveyModule, UserDataModule],
})
export class ModulesModule {}
