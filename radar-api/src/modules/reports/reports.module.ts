import { Module } from '@nestjs/common';
import { ItemAnalysisModule } from '../item-analysis/item-analysis.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
    imports: [ItemAnalysisModule],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule {}
