/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ExternalDataUsageModule } from '../external-data-usage/external-data-usage.module';
import { ItemAnalysisService } from './item-analysis.service';

@Module({
    imports: [ExternalDataUsageModule],
    providers: [ItemAnalysisService],
    exports: [ItemAnalysisService],
})
export class ItemAnalysisModule {}
