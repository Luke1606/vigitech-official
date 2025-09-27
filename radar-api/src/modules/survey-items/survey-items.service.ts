/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { UUID } from 'crypto';
import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';

import { PrismaClient, ItemAnalysis, SurveyItem } from '@prisma/client';

import { UpdateSurveyItemDto } from './dto/update-survey-item.dto';
import { SurveyItemWithAnalysisType } from './types/survey-item-with-analysis.type';
import { ExternalDataUsageService } from '../external-data-usage/external-data-usage.service';
import { CreateSurveyItemType } from './types/create-survey-item.type';
import { ItemAnalysisService } from '../item-analysis/item-analysis.service';

@Injectable()
export class SurveyItemsService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger: Logger = new Logger('SurveyItemsService');

    constructor(
        private readonly externalDataUsageService: ExternalDataUsageService,
        private readonly itemAnalysisService: ItemAnalysisService
    ) {
        super();
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Initialized and connected to database');
    }

    async findAllRecommended(): Promise<SurveyItemWithAnalysisType[]> {
        this.logger.log('Executed findAllRecommended');

        const items: SurveyItem[] = await this.surveyItem.findMany({
            where: {
                subscribed: false,
            },
        });

        const itemsWithAnalysis: SurveyItemWithAnalysisType[] = [];

        for (let index = 0; index < items.length; index++) {
            const item = items[index];

            const lastAnalysis: ItemAnalysis =
                await this.itemAnalysisService.findLastAnalysisFromItem(
                    item.id as UUID
                );

            itemsWithAnalysis.push({
                item,
                lastAnalysis,
            });
        }

        return itemsWithAnalysis;
    }

    async findAllSubscribed(): Promise<SurveyItemWithAnalysisType[]> {
        this.logger.log('Executed findAllSubscribed');

        const items: SurveyItem[] = await this.surveyItem.findMany({
            where: {
                subscribed: true,
            },
        });

        const itemsWithAnalysis: SurveyItemWithAnalysisType[] = [];

        for (let index = 0; index < items.length; index++) {
            const item = items[index];

            const lastAnalysis: ItemAnalysis =
                await this.itemAnalysisService.findLastAnalysisFromItem(
                    item.id as UUID
                );

            itemsWithAnalysis.push({
                item,
                lastAnalysis,
            });
        }
        return itemsWithAnalysis;
    }

    async findOne(id: UUID): Promise<SurveyItemWithAnalysisType> {
        this.logger.log(`Executed findOne of ${id}`);

        const item: SurveyItem = await this.surveyItem.findUniqueOrThrow({
            where: { id },
        });

        const lastAnalysis: ItemAnalysis =
            await this.itemAnalysisService.findLastAnalysisFromItem(
                item.id as UUID
            );

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

    // ejecutar periodicamente segun la config
    private async renewItemRecommendations(): Promise<void> {
        this.logger.log('Executed renewItems');

        // borrar los desactivados
        await this.surveyItem.deleteMany({
            where: {
                active: false,
            },
        });

        const subscribedItems: CreateSurveyItemType[] = await this.surveyItem
            .findMany({
                where: {
                    subscribed: true,
                },
            })
            .then((items: SurveyItem[]) =>
                items.map((item: SurveyItem) => {
                    const { title, summary, radarQuadrant } = item;
                    return {
                        title,
                        summary,
                        radarQuadrant,
                    } as CreateSurveyItemType;
                })
            );

        // obtener nuevos
        const trendingItems: CreateSurveyItemType[] =
            await this.externalDataUsageService.getNewTrendings();

        const stillRelevant: CreateSurveyItemType[] = [];
        const newTrendings: CreateSurveyItemType[] = [];

        trendingItems.forEach((trendingItem: CreateSurveyItemType) => {
            if (subscribedItems.includes(trendingItem)) {
                // hace falta ver como verificar que sea el mismo item aunque cambie alguna propiedad en las fuentes
                // mediante la URI o algo asi, pq hasta la URL puede cambiar, y si algo en ese caso llamar a update
                stillRelevant.push(trendingItem);
                subscribedItems.filter((item) => item !== trendingItem);
            } else newTrendings.push(trendingItem);
        });

        const notRelevantAnymore: CreateSurveyItemType[] = subscribedItems;

        const createdNewTrendings: SurveyItem[] =
            await this.surveyItem.createManyAndReturn({
                data: newTrendings,
                skipDuplicates: true,
            });

        // insertar el primer analisis de cada uno
        await this.itemAnalysisService.createAndGetAnalysisesFromSurveyItems(
            createdNewTrendings
        );

        // notificar los q ya no son relevantes
        this.logger.log(notRelevantAnymore);
    }

    // ejecutar periodicamente segun la config
    private async renewItemAnalysises() {
        const items: SurveyItem[] = await this.findAllSubscribed().then(
            (itemsWithAnalysis: SurveyItemWithAnalysisType[]) =>
                itemsWithAnalysis.map(
                    (itemsWithAnalysis: SurveyItemWithAnalysisType) =>
                        itemsWithAnalysis.item
                )
        );

        const newAnalysises: ItemAnalysis[] =
            await this.itemAnalysisService.createAndGetAnalysisesFromSurveyItems(
                items
            );

        const changes: number = 0;
        this.logger.log(
            `Analysises renewed. It has ${changes} changes in ${newAnalysises.length} items`
        );
    }

    async findAllInsideIntervalFromObjective(
        itemId: UUID,
        startDate: Date,
        endDate: Date
    ) {
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

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }
}
