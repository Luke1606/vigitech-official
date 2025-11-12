import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserDataModule } from './user-data/user-data.module';
import { TechnologySurveyModule } from './technology-survey/technology-survey.module';

@Module({
    imports: [AuthModule, UserDataModule, TechnologySurveyModule],
})
export class ModulesModule {}
