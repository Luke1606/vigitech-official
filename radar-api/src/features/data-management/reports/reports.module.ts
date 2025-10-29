import { Module } from '@nestjs/common';
import { ItemAnalysisModule } from '../../item-analysis/item-analysis.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SurveyItemsModule } from '../survey-items/survey-items.module';

@Module({
    imports: [ItemAnalysisModule, SurveyItemsModule],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule {}
