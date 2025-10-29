import type { UUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';

import { GeneralSearchResult, Insights, ItemAnalysis, SurveyItem } from '@prisma/client';

import { ExternalDataUsageService } from '../external-data-usage/external-data-usage.service';
import { CreateItemAnalysisType } from './types/create-item-analysis.type';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class ItemAnalysisService {
    private readonly logger: Logger = new Logger('ItemAnalysisService');

    constructor(
        private readonly externalDataUsageService: ExternalDataUsageService,
        private readonly prisma: PrismaService,
    ) {}

    async createAndGetAnalysisesFromSurveyItems(items: SurveyItem[]): Promise<ItemAnalysis[]> {
        const analysises: CreateItemAnalysisType[] = [];

        for (let index = 0; index < items.length; index++) {
            const item = items[index];

            const searchedData: GeneralSearchResult = await this.externalDataUsageService.getSurveyItemData(item);

            const analyzedMetrics: Insights = await this.externalDataUsageService.getSurveyItemMetricsFromData(
                item,
                searchedData,
            );

            analysises.push({
                itemId: item.id,
                dataId: searchedData.id,
                metricsId: analyzedMetrics.id,
            });
        }

        return await this.prisma.itemAnalysis.createManyAndReturn({
            data: analysises,
            skipDuplicates: false,
        });
    }

    async findAllInsideIntervalFromObjective(itemId: UUID, startDate: Date, endDate: Date): Promise<ItemAnalysis[]> {
        return await this.prisma.itemAnalysis
            .findMany({
                where: { itemId },
                orderBy: { createdAt: 'asc' },
            })
            .then((analysisFromItem: ItemAnalysis[]) =>
                analysisFromItem.filter((analysis) => analysis.createdAt > startDate && analysis.createdAt < endDate),
            );
    }

    async findLastAnalysisFromItem(itemId: UUID): Promise<ItemAnalysis> {
        return await this.prisma.itemAnalysis.findFirstOrThrow({
            where: { itemId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
