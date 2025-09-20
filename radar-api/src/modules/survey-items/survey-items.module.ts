import { Module } from '@nestjs/common';

import { SurveyItemsService } from './survey-items.service';
import { SurveyItemsController } from './survey-items.controller';
import { ExternalActorsModule } from './external-actors/external-actors.module';
@Module({
    imports: [ExternalActorsModule],
    controllers: [SurveyItemsController],
    providers: [SurveyItemsService],
})
export class SurveyItemsModule {}
