/* eslint-disable prettier/prettier */
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
    ItemAnalysis,
    SurveyItem,
} from '@prisma/client';

import { ExternalDataUsageService } from '../external-data-usage/external-data-usage.service.js';
import { CreateItemAnalysisType } from './types/create-item-analysis.type.js';


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

    async createAndGetAnalysisesFromSurveyItems(
        items: SurveyItem[]
    ): Promise<ItemAnalysis[]> {
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
                metricsId: analyzedMetrics.id,
            });
        }

        return await this.itemAnalysis.createManyAndReturn({
            data: analysises,
            skipDuplicates: false,
        });
    }

    async findAllInsideIntervalFromObjective(
        itemId: UUID,
        startDate: Date,
        endDate: Date
    ): Promise<ItemAnalysis[]> {
        return await this.itemAnalysis
            .findMany({
                where: { itemId },
                orderBy: { createdAt: 'asc' },
            })
            .then((analysisFromItem: ItemAnalysis[]) =>
                analysisFromItem.filter(
                    (analysis) =>
                        analysis.createdAt > startDate &&
                        analysis.createdAt < endDate
                )
            );
    }

    async findLastAnalysisFromItem(
        itemId: UUID
    ): Promise<ItemAnalysis> {
        return await this.itemAnalysis.findFirstOrThrow({
            where: { itemId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }
}
