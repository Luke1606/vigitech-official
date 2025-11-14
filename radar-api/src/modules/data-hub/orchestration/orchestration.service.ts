import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CollectionService } from '../collection/collection.service';
import { ProcessingService } from '../processing/processing.service';
import { RawDataSource } from '@prisma/client';
import { PrismaService } from '../../../common/services/prisma.service';

@Injectable()
export class OrchestrationService {
    private readonly logger = new Logger(OrchestrationService.name);

    constructor(
        private readonly collectionService: CollectionService,
        private readonly processingService: ProcessingService,
        private readonly prisma: PrismaService,
    ) {}

    @Cron(CronExpression.EVERY_HOUR) // Example: Run every hour
    async handleDataCollectionCron() {
        this.logger.log('Starting scheduled data collection...');
        // Example: Collect data from GitHub for a specific query
        await this.collectionService.collectData(RawDataSource.GITHUB, 'nestjs');
        this.logger.log('Data collection finished.');
    }

    @Cron(CronExpression.EVERY_30_SECONDS) // Example: Run every 30 seconds for unprocessed data
    async handleDataProcessingCron() {
        this.logger.log('Starting scheduled data processing...');
        const unprocessedRawData = await (this.prisma as any).tech_survey.rawData.findMany({
            where: {
                processedAt: null,
            },
            select: {
                id: true,
            },
        });

        for (const rawDataItem of unprocessedRawData) {
            await this.processingService.processRawData(rawDataItem.id);
        }
        this.logger.log('Data processing finished.');
    }
}
