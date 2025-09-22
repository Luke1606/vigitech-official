import type { UUID } from 'crypto';
import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import {
    GeneralSearchResult,
    Metrics,
    PrismaClient,
    SubscribedItemAnalysis,
    SurveyItem,
} from '@prisma/client';

import { ExternalDataUsageService } from '../external-data-usage/external-data-usage.service';
import { CreateItemAnalysisType } from './types/create-item-analysis.type';

@Injectable()
export class ItemAnalysisService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger: Logger = new Logger('ItemAnalysisService');

    constructor(
        private readonly externalDataUsageService: ExternalDataUsageService
    ) {
        super();
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Initialized and connected to database');
    }

    async getAnalysisesFromSurveyItems(
        items: SurveyItem[]
    ): Promise<SubscribedItemAnalysis[]> {
        const analysises: CreateItemAnalysisType[] = [];

        for (let index = 0; index < items.length; index++) {
            const item = items[index];

            const searchedData: GeneralSearchResult =
                await this.externalDataUsageService.getSurveyItemData(item);

            const analyzedMetrics: Metrics =
                await this.externalDataUsageService.getSurveyItemMetricsFromData(
                    item,
                    searchedData
                );

            analysises.push({
                itemId: item.id,
                dataId: searchedData.id,
                searchedData,
                metricsId: analyzedMetrics.id,
                analyzedMetrics,
            });
        }

        return await this.subscribedItemAnalysis.createMany({
            data: analysises,
            skipDuplicates: false,
        });
    }

    async findAllInsideIntervalFromObjective(
        itemId: UUID,
        startDate: Date,
        endDate: Date
    ) {
        return await this.subscribedItemAnalysis
            .findMany({
                where: { itemId },
                orderBy: { createdAt: 'asc' },
            })
            .then((analysisFromItem: SubscribedItemAnalysis[]) =>
                analysisFromItem.filter(
                    (analysis) =>
                        analysis.createdAt > startDate &&
                        analysis.createdAt < endDate
                )
            );
    }

    async findLastAnalysisFromItem(
        itemId: UUID
    ): Promise<SubscribedItemAnalysis> {
        return await this.subscribedItemAnalysis.findFirstOrThrow({
            where: { itemId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }
}
