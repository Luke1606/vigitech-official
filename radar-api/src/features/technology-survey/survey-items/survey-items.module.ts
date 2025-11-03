import { Module } from '@nestjs/common';
import { SurveyItemsService } from './survey-items.service';
import { SurveyItemsController } from './survey-items.controller';

@Module({
    controllers: [SurveyItemsController],
    providers: [SurveyItemsService],
})
export class SurveyItemsModule {}
