import { Module } from '@nestjs/common';

import { SurveyItemsService } from './survey-items.service';
import { SurveyItemsController } from './survey-items.controller';
import { ExternalDataUsageModule } from '../external-data-usage/external-data-usage.module';
import { ItemAnalysisModule } from '../item-analysis/item-analysis.module';

@Module({
    imports: [ExternalDataUsageModule, ItemAnalysisModule],
    controllers: [SurveyItemsController],
    providers: [SurveyItemsService],
})
export class SurveyItemsModule {}
