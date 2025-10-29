import type { UUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';

import { ItemAnalysis, SurveyItem, UserSubscribedItem, UserHiddenItem, RadarRing } from '@prisma/client';

import { SurveyItemWithAnalysisType } from './types/survey-item-with-analysis.type';
import { ExternalDataUsageService } from '../../external-data-usage/external-data-usage.service';
import { CreateSurveyItemType } from './types/create-survey-item.type';
import { ItemAnalysisService } from '../../item-analysis/item-analysis.service';
import { PrismaService } from '../../../common/services/prisma.service';

@Injectable()
export class SurveyItemsService {
    private readonly logger: Logger = new Logger('SurveyItemsService');

    constructor(
        private readonly externalDataUsageService: ExternalDataUsageService,
        private readonly itemAnalysisService: ItemAnalysisService,
        private readonly prisma: PrismaService,
    ) {}

    async findAllRecommended(userId: UUID): Promise<SurveyItemWithAnalysisType[]> {
        this.logger.log('Executed findAllRecommended');

        const subscribedItems = await this.prisma.userSubscribedItem.findMany({
            where: { userId },
            select: { itemId: true },
        });

        const hiddenItems = await this.prisma.userHiddenItem.findMany({
            where: { userId },
            select: { itemId: true },
        });

        const excludedItemIds = [...subscribedItems.map((si) => si.itemId), ...hiddenItems.map((hi) => hi.itemId)];

        const items: SurveyItem[] = await this.prisma.surveyItem.findMany({
            where: {
                id: {
                    notIn: excludedItemIds,
                },
            },
        });

        const itemsWithAnalysis: SurveyItemWithAnalysisType[] = [];

        for (let index = 0; index < items.length; index++) {
            const item = items[index];

            const lastAnalysis: ItemAnalysis = await this.itemAnalysisService.findLastAnalysisFromItem(item.id as UUID);

            itemsWithAnalysis.push({
                item,
                lastAnalysis,
            });
        }

        return itemsWithAnalysis;
    }

    async findAllSubscribed(userId: UUID): Promise<SurveyItemWithAnalysisType[]> {
        this.logger.log('Executed findAllSubscribed');

        const userSubscribedItems = await this.prisma.userSubscribedItem.findMany({
            where: { userId },
            include: { item: true },
        });

        const itemsWithAnalysis: SurveyItemWithAnalysisType[] = [];

        for (let index = 0; index < userSubscribedItems.length; index++) {
            const userSubscribedItem = userSubscribedItems[index];

            const lastAnalysis: ItemAnalysis = await this.itemAnalysisService.findLastAnalysisFromItem(
                userSubscribedItem.itemId as UUID,
            );

            itemsWithAnalysis.push({
                item: userSubscribedItem.item,
                lastAnalysis,
            });
        }
        return itemsWithAnalysis;
    }

    async findOne(id: UUID, userId: UUID): Promise<SurveyItemWithAnalysisType> {
        this.logger.log(`Executed findOne of ${id}`);

        const item: SurveyItem = await this.prisma.surveyItem.findUniqueOrThrow({
            where: { id },
        });

        // Verificar si el item está oculto para el usuario
        const isHidden = await this.prisma.userHiddenItem.findUnique({
            where: {
                userId_itemId: {
                    userId,
                    itemId: id,
                },
            },
        });

        if (isHidden) {
            throw new Error(`El item de id ${id} no está disponible`);
        }

        const lastAnalysis: ItemAnalysis = await this.itemAnalysisService.findLastAnalysisFromItem(item.id as UUID);

        if (!item) throw new Error(`No existe el item de id ${id}`);

        return {
            item,
            lastAnalysis,
        };
    }

    async create(data: CreateSurveyItemType, insertedById: UUID): Promise<SurveyItem> {
        this.logger.log('Executed create');

        const item: SurveyItem = await this.prisma.surveyItem.create({
            data: {
                ...data,
                insertedById,
            },
        });

        await this.subscribeOne(item.id as UUID, insertedById);
    }

    async subscribeOne(id: UUID, userId: UUID): Promise<UserSubscribedItem> {
        this.logger.log(`Executed subscribe of ${id}`);
        await this.findOne(id, userId);

        await this.prisma.userHiddenItem.deleteMany({
            where: {
                userId,
                itemId: id,
            },
        });

        return await this.prisma.userSubscribedItem.create({
            data: {
                userId,
                itemId: id,
            },
        });
    }

    async unsubscribeOne(id: UUID, userId: UUID): Promise<void> {
        this.logger.log(`Executed unsubscribe of ${id}`);

        await this.prisma.userSubscribedItem.deleteMany({
            where: {
                userId,
                itemId: id,
            },
        });
    }

    async removeOne(id: UUID, userId: UUID): Promise<UserHiddenItem> {
        this.logger.log(`Executed remove of ${id}`);

        await this.prisma.userSubscribedItem.deleteMany({
            where: {
                userId,
                itemId: id,
            },
        });

        return await this.prisma.userHiddenItem.create({
            data: {
                userId,
                itemId: id,
            },
        });
    }

    async subscribeBatch(ids: UUID[], userId: UUID): Promise<void> {
        this.logger.log(`Executed subscribe of ${ids.length} items`);

        await this.prisma.userHiddenItem.deleteMany({
            where: {
                userId,
                itemId: { in: ids },
            },
        });

        await Promise.all(
            ids.map((itemId) =>
                this.prisma.userSubscribedItem.upsert({
                    where: {
                        userId_itemId: {
                            userId,
                            itemId,
                        },
                    },
                    create: {
                        userId,
                        itemId,
                    },
                    update: {},
                }),
            ),
        );
    }

    async unsubscribeBatch(ids: UUID[], userId: UUID): Promise<void> {
        this.logger.log(`Executed unsubscribe of ${ids.length} items`);

        await this.prisma.userSubscribedItem.deleteMany({
            where: {
                userId,
                itemId: { in: ids },
            },
        });
    }

    async removeBatch(ids: UUID[], userId: UUID): Promise<void> {
        this.logger.log(`Executed remove of ${ids.length} items`);

        await this.prisma.userSubscribedItem.deleteMany({
            where: {
                userId,
                itemId: { in: ids },
            },
        });

        await Promise.all(
            ids.map((itemId) =>
                this.prisma.userHiddenItem.upsert({
                    where: {
                        userId_itemId: {
                            userId,
                            itemId,
                        },
                    },
                    create: {
                        userId,
                        itemId,
                    },
                    update: {},
                }),
            ),
        );
    }

    // ejecutar periodicamente segun la config
    private async renewItemRecommendations(userId: UUID): Promise<void> {
        this.logger.log('Executed renewItems');

        // Obtener items suscritos del usuario
        const userSubscribedItems = await this.prisma.userSubscribedItem.findMany({
            where: { userId },
            include: { item: true },
        });

        const subscribedItems: CreateSurveyItemType[] = userSubscribedItems.map((userSubscribedItem) => {
            const { title, summary, radarQuadrant } = userSubscribedItem.item;
            return {
                title,
                summary,
                radarQuadrant,
            } as CreateSurveyItemType;
        });

        // obtener nuevos
        const trendingItems: CreateSurveyItemType[] = await this.externalDataUsageService.getNewTrendings();

        const stillRelevant: CreateSurveyItemType[] = [];
        const newTrendings: CreateSurveyItemType[] = [];

        trendingItems.forEach((trendingItem: CreateSurveyItemType) => {
            if (
                subscribedItems.some(
                    (subItem) =>
                        subItem.title === trendingItem.title && subItem.radarQuadrant === trendingItem.radarQuadrant,
                )
            ) {
                stillRelevant.push(trendingItem);
            } else {
                newTrendings.push(trendingItem);
            }
        });

        const notRelevantAnymore: CreateSurveyItemType[] = subscribedItems.filter(
            (subItem) =>
                !stillRelevant.some(
                    (relItem) => relItem.title === subItem.title && relItem.radarQuadrant === subItem.radarQuadrant,
                ),
        );

        // Crear nuevos items
        const createdNewTrendings: SurveyItem[] = await Promise.all(
            newTrendings.map((trendingItem) =>
                this.prisma.surveyItem.create({
                    data: {
                        title: trendingItem.title,
                        summary: trendingItem.summary,
                        radarQuadrant: trendingItem.radarQuadrant,
                        radarRing: RadarRing.UNKNOWN,
                    },
                }),
            ),
        );

        // insertar el primer analisis de cada uno
        await this.itemAnalysisService.createAndGetAnalysisesFromSurveyItems(createdNewTrendings);

        // Eliminar suscripciones de items no relevantes
        const notRelevantItemIds = userSubscribedItems
            .filter((userSubItem) =>
                notRelevantAnymore.some(
                    (nrItem) =>
                        nrItem.title === userSubItem.item.title &&
                        nrItem.radarQuadrant === userSubItem.item.radarQuadrant,
                ),
            )
            .map((userSubItem) => userSubItem.itemId);

        if (notRelevantItemIds.length > 0) {
            await this.prisma.userSubscribedItem.deleteMany({
                where: {
                    userId,
                    itemId: { in: notRelevantItemIds },
                },
            });
        }

        this.logger.log(`Removed ${notRelevantAnymore.length} items that are no longer relevant`);
    }

    // ejecutar periodicamente segun la config
    private async renewItemAnalysises(userId: UUID) {
        const userSubscribedItems = await this.prisma.userSubscribedItem.findMany({
            where: { userId },
            include: { item: true },
        });

        const items: SurveyItem[] = userSubscribedItems.map((usi) => usi.item);

        const newAnalysises: ItemAnalysis[] =
            await this.itemAnalysisService.createAndGetAnalysisesFromSurveyItems(items);

        const changes: number = 0;
        this.logger.log(`Analysises renewed. It has ${changes} changes in ${newAnalysises.length} items`);
    }

    async findAllInsideIntervalFromObjective(itemId: UUID, startDate: Date, endDate: Date) {
        return await this.prisma.itemAnalysis.findMany({
            where: {
                itemId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
}
