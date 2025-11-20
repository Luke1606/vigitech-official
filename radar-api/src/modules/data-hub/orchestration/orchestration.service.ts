import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/common/services/prisma.service';
import { CollectionService } from '../collection/collection.service';
import { ProcessingService } from '../processing/processing.service';

@Injectable()
export class OrchestrationService {
    private readonly logger = new Logger(OrchestrationService.name);

    constructor(
        private readonly collectionService: CollectionService,
        private readonly processingService: ProcessingService,
        private readonly prisma: PrismaService,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async handleDataCollectionCron() {
        this.logger.log('Starting scheduled data collection...');

        await this.collectionService.collectAllDataAndSave();

        this.logger.log('Data collection finished.');
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async handleDataProcessingCron() {
        this.logger.log('Starting scheduled data processing...');
        const unprocessedRawData = await this.prisma.rawData.findMany({
            where: {
                processedAt: null,
            },
        });

        await this.processingService.processRawData(unprocessedRawData);
        this.logger.log('Data processing finished.');
    }
}
