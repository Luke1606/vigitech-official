import type { UUID } from 'crypto';
import {
    Body,
    Controller,
    Get,
    Logger,
    ParseDatePipe,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AnalysisHistoryType } from './types/analysis-history.type';

@Controller('reports')
export class ReportsController {
    private readonly logger: Logger = new Logger('ReportsController');

    constructor(private readonly reportsService: ReportsService) {
        this.logger.log('Initialized');
    }

    @Get('generate')
    async generate(
        @Body('itemIds', new ParseUUIDPipe()) itemIds: UUID[],
        @Body('startDate', new ParseDatePipe()) startDate: Date,
        @Body('endDate', new ParseDatePipe()) endDate: Date
    ): Promise<AnalysisHistoryType[]> {
        return await this.reportsService.generate(itemIds, startDate, endDate);
    }
}
