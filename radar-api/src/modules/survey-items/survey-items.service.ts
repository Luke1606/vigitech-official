import type { UUID } from 'crypto';
import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import {
    PrismaClient,
    // RadarQuadrant,
    // RadarRing,
    SubscribedItemAnalysis,
    SurveyItem,
} from '@prisma/client';

import { UpdateSurveyItemDto } from './dto/update-survey-item.dto';
import { SurveyItemBasicData } from './types/survey-item-basic-data.type';
import { SurveyItemWithAnalysis } from './types/survey-item-with-analysis.type';
import { ExternalDataUsageService } from '../external-data-usage/external-data-usage.service';
import { CreateSurveyItemDto } from './dto/create-survey-item.dto';

@Injectable()
export class SurveyItemsService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger: Logger = new Logger('SurveyItemsService');

    constructor(
        private readonly externalDataUsageService: ExternalDataUsageService
    ) {
        super();
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Initialized and connected to database');
    }

    async findAllRecommended(): Promise<SurveyItem[]> {
        this.logger.log('Executed findAllRecommended');

        return await this.surveyItem.findMany({
            where: {
                subscribed: false,
            },
        });
    }

    async findAllSubscribed(): Promise<SurveyItem[]> {
        this.logger.log('Executed findAllSubscribed');

        return await this.surveyItem.findMany({
            where: {
                subscribed: true,
            },
        });
    }

    async findOne(id: UUID): Promise<SurveyItemWithAnalysis> {
        this.logger.log(`Executed findOne of ${id}`);

        const item: SurveyItem = await this.surveyItem.findUniqueOrThrow({
            where: { id },
        });

        const lastAnalysis: SubscribedItemAnalysis =
            await this.findLastAnalysisFromItem(item.id as UUID);

        if (!item) throw new Error(`No existe el item de id ${id}`);
        if (!item.active)
            throw new Error(`El item de id ${id} no está disponible`);

        return {
            item,
            lastAnalysis,
        };
    }

    async subscribeOne(id: UUID): Promise<SurveyItem> {
        this.logger.log(`Executed subscribe of ${id}`);
        await this.findOne(id);

        return await this.updateSurveyItem(id, {
            subscribed: true,
            active: true,
        });
    }

    async unsubscribeOne(id: UUID): Promise<SurveyItem> {
        this.logger.log(`Executed unsubscribe of ${id}`);
        await this.findOne(id);

        return await this.updateSurveyItem(id, {
            subscribed: false,
        });
    }

    async removeOne(id: UUID): Promise<SurveyItem> {
        this.logger.log(`Executed remove of ${id}`);
        return await this.updateSurveyItem(id, {
            subscribed: false,
        });
    }

    async subscribeBatch(ids: UUID[]): Promise<void> {
        this.logger.log(`Executed subscribe of ${ids.length} items`);

        return await this.updateManySurveyItems(ids, {
            subscribed: true,
            active: true,
        });
    }

    async unsubscribeBatch(ids: UUID[]): Promise<void> {
        this.logger.log(`Executed unsubscribe of ${ids.length} items`);

        return await this.updateManySurveyItems(ids, {
            subscribed: false,
        });
    }

    async removeBatch(ids: UUID[]): Promise<void> {
        this.logger.log(`Executed remove of ${ids.length} items`);

        return await this.updateManySurveyItems(ids, {
            subscribed: false,
            active: false,
        });
    }

    private async updateSurveyItem(
        id: UUID,
        data: UpdateSurveyItemDto
    ): Promise<SurveyItem> {
        return await this.surveyItem.update({
            where: { id },
            data,
        });
    }

    private async updateManySurveyItems(
        ids: UUID[],
        data: UpdateSurveyItemDto
    ): Promise<void> {
        await this.surveyItem.updateMany({
            where: {
                id: { in: ids },
            },
            data: data,
        });
    }

    private async renewItems(): Promise<void> {
        this.logger.log('Executed renewItems');
        // borrar los no suscritos
        await this.surveyItem.deleteMany({
            where: {
                active: false,
            },
        });

        const subscribedItems: SurveyItemBasicData[] = await this.surveyItem
            .findMany({
                where: {
                    subscribed: true,
                },
            })
            .then((items: SurveyItem[]) =>
                items.map((item: SurveyItem) => {
                    const { title, summary, source } = item;
                    return {
                        title,
                        summary,
                        source,
                    };
                })
            );

        // obtener nuevos
        const trendingItems: SurveyItemWithAnalysis[] =
            await this.externalDataUsageService.getNewTrendings();
        const stillRelevant: CreateSurveyItemDto[] = [];
        const newTrendings: CreateSurveyItemDto[] = [];

        trendingItems.forEach((trendingItem: SurveyItemWithAnalysis) => {
            if (subscribedItems.includes(trendingItem.item)) {
                // hace falta ver como verificar que sea el mismo item aunque cambie alguna propiedad en las fuentes
                // mediante la URI o algo asi, pq hasta la URL puede cambiar, y si algo en ese caso llamar a update
                stillRelevant.push(trendingItem);
                subscribedItems.filter((item) => item !== trendingItem);
            } else newTrendings.push(trendingItem);
        });

        const notRelevantAnymore: SurveyItemBasicData[] = subscribedItems;

        await this.surveyItem.createMany({
            data: { ...newTrendings },
            skipDuplicates: true,
        });

        // notificar los q ya no son relevantes
        this.logger.log(notRelevantAnymore);
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

    private async findLastAnalysisFromItem(
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
