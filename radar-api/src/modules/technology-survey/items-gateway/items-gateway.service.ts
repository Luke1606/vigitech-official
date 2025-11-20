import type { UUID } from 'crypto';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';

import { UserSubscribedItem, Item } from '@prisma/client';

import { ClassifiedItemType } from './types/classified-item.type';
import { CreateSurveyItemType } from './types/create-item.type';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class ItemsGatewayService {
    private readonly logger: Logger = new Logger('SurveyItemsService');

    constructor(private readonly prisma: PrismaService) {}

    async findAllRecommended(userId: UUID): Promise<Item[]> {
        this.logger.log('Executed findAllRecommended');

        return this.prisma.item.findMany({
            where: {
                subscribedBy: {
                    none: { userId },
                },
                hiddenBy: {
                    none: { userId },
                },
            },
        });
    }

    async findAllSubscribed(userId: string): Promise<Item[]> {
        this.logger.log('Executed findAllSubscribed');

        return this.prisma.item.findMany({
            where: {
                subscribedBy: {
                    some: { userId },
                },
            },
        });
    }

    async findOne(id: UUID, userId: UUID): Promise<Item> {
        this.logger.log(`Executed findOne of ${id}`);

        const item: Item = await this.prisma.item.findUniqueOrThrow({
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
            throw new ForbiddenException(`El item de id ${id} no está disponible para este usuario`);
        }

        return item;
    }

    async create(data: CreateSurveyItemType, insertedById: UUID): Promise<Item> {
        this.logger.log('Executed create');

        const classifiedItem: ClassifiedItemType = await this.classifyItem(data);

        const item: Item = await this.prisma.item.create({
            data: {
                ...classifiedItem,
                insertedById,
            },
        });

        await this.subscribeOne(item.id as UUID, insertedById);

        return item;
    }

    async subscribeOne(id: UUID, userId: UUID): Promise<UserSubscribedItem> {
        this.logger.log(`Executed subscribe of ${id}`);

        await this.prisma.item.findUniqueOrThrow({ where: { id } });

        await this.prisma.userHiddenItem.deleteMany({
            where: { userId, itemId: id },
        });

        return this.prisma.userSubscribedItem.upsert({
            where: { userId_itemId: { userId, itemId: id } },
            create: { userId, itemId: id },
            update: {},
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

    async removeOne(id: UUID, userId: UUID): Promise<void> {
        this.logger.log(`Executed remove of ${id}`);

        const item = await this.prisma.item.findUniqueOrThrow({
            where: { id },
            select: { insertedById: true },
        });

        if ((item.insertedById as UUID) === userId) {
            this.logger.log(`Item ${id} created by user. Deleting permanently.`);

            await this.prisma.item.delete({
                where: { id },
            });
        } else {
            this.logger.log(`Item ${id} is a recommendation. Hiding.`);

            await this.prisma.userSubscribedItem.deleteMany({
                where: {
                    itemId: id,
                    userId,
                },
            });

            await this.prisma.userHiddenItem.create({
                data: { itemId: id, userId },
            });
        }
    }

    async createBatch(data: CreateSurveyItemType[], userId?: UUID): Promise<void> {
        const mode = userId ? 'MANUAL (User)' : 'AUTOMATIC (System)';
        this.logger.log(`Executed createBatch [${mode}] of ${data.length} items`);

        const classifiedItems: ClassifiedItemType[] = await this.classifyBatch(data);

        const createdItems: Item[] = await this.prisma.item.createManyAndReturn({
            data: classifiedItems.map((item) => ({
                ...item,
                insertedById: userId ? (userId as string) : undefined,
            })),
            skipDuplicates: true,
        });

        if (createdItems.length > 0 && userId) {
            this.logger.log(`Auto-subscribing user ${userId} to ${createdItems.length} items`);

            await this.prisma.userSubscribedItem.createMany({
                data: createdItems.map((item: Item) => ({
                    userId: userId as string,
                    itemId: item.id,
                })),
                skipDuplicates: true,
            });
        }
    }

    async subscribeBatch(ids: UUID[], userId: UUID): Promise<void> {
        this.logger.log(`Executed subscribe of ${ids.length} items`);

        await this.prisma.userSubscribedItem.createMany({
            data: ids.map((itemId) => ({
                userId,
                itemId,
            })),
            skipDuplicates: true,
        });
    }

    async unsubscribeBatch(ids: UUID[], userId: UUID): Promise<void> {
        this.logger.log(`Executed unsubscribeBatch of ${ids.length} items`);

        await this.prisma.userSubscribedItem.deleteMany({
            where: {
                userId,
                itemId: { in: ids },
            },
        });
    }

    async removeBatch(ids: UUID[], userId: UUID): Promise<void> {
        this.logger.log(`Executed remove of ${ids.length} items`);

        const itemsToCheck = await this.prisma.item.findMany({
            where: { id: { in: ids } },
            select: { id: true, insertedById: true },
        });

        const idsToDelete: string[] = [];
        const idsToHide: string[] = [];

        for (const item of itemsToCheck) {
            if (item.insertedById === userId) {
                idsToDelete.push(item.id);
            } else {
                idsToHide.push(item.id);
            }
        }

        if (idsToDelete.length > 0) {
            this.logger.log(`Deleting ${idsToDelete.length} user-owned items`);
            await this.prisma.item.deleteMany({
                where: { id: { in: idsToDelete } },
            });
        }

        if (idsToHide.length > 0) {
            this.logger.log(`Hiding ${idsToHide.length} recommended items`);

            await this.prisma.userSubscribedItem.deleteMany({
                where: {
                    userId: userId,
                    itemId: { in: idsToHide },
                },
            });

            await this.prisma.userHiddenItem.createMany({
                data: idsToHide.map((itemId) => ({
                    userId: userId,
                    itemId,
                })),
                skipDuplicates: true,
            });
        }
    }

    private async classifyItem(item: CreateSurveyItemType): Promise<ClassifiedItemType> {
        return Promise.resolve(item as ClassifiedItemType);
    }

    private async classifyBatch(items: CreateSurveyItemType[]): Promise<ClassifiedItemType[]> {
        return Promise.resolve(items as ClassifiedItemType[]);
    }
}
