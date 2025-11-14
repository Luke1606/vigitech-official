import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserDataModule } from './user-data/user-data.module';
import { TechnologySurveyModule } from './technology-survey/technology-survey.module';
import { CentralizedAiAgentModule } from './centralized-ai-agent/centralized-ai-agent.module';

@Module({
    imports: [AuthModule, UserDataModule, TechnologySurveyModule, CentralizedAiAgentModule],
})
export class ModulesModule {}
