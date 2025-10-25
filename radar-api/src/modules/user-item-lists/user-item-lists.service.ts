import type { UUID } from 'crypto';
import { Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient, UserItemList } from '@prisma/client';

import { CreateUserItemListDto } from './dto/create-user-item-list.dto';
import { UpdateUserItemListDto } from './dto/update-user-item-list.dto';

const itemSelection = {
    id: true,
    title: true,
    summary: true,
    radarQuadrant: true,
    radarRing: true,
} satisfies Prisma.SurveyItemSelect;

const listIncludeItems = {
    items: {
        select: itemSelection,
    },
} satisfies Prisma.UserItemListInclude;

@Injectable()
export class UserItemListsService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger: Logger = new Logger('UserItemListService');

    async onModuleInit(): Promise<void> {
        await this.$connect();
        this.logger.log('Initialized and connected to database');
    }

    async findAll(ownerId: UUID): Promise<UserItemList[]> {
        return await this.userItemList.findMany({
            where: { ownerId },
            include: listIncludeItems,
        });
    }

    async findOne(id: UUID): Promise<UserItemList> {
        return await this.userItemList.findUniqueOrThrow({
            where: { id },
            include: listIncludeItems,
        });
    }

    async createList(ownerId: UUID, data: CreateUserItemListDto): Promise<UserItemList> {
        return this.userItemList.create({
            data: {
                ownerId,
                ...data,
            },
        });
    }

    async updateList(id: UUID, data: UpdateUserItemListDto): Promise<UserItemList> {
        return await this.userItemList.update({
            where: { id },
            data,
            include: listIncludeItems,
        });
    }

    async removeList(id: UUID): Promise<UserItemList> {
        return await this.userItemList.delete({
            where: { id },
        });
    }

    async appendOneItem(listId: UUID, itemId: UUID): Promise<UserItemList> {
        await this.surveyItem.findUniqueOrThrow({ where: { id: itemId } });

        return await this.userItemList.update({
            where: { id: listId },
            data: {
                items: {
                    connect: { id: itemId },
                },
            },
            include: listIncludeItems,
        });
    }

    async appendAllItems(listId: UUID, itemIds: UUID[]): Promise<UserItemList> {
        const items = await this.surveyItem.findMany({
            where: { id: { in: itemIds } },
        });

        if (items.length !== itemIds.length) {
            throw new NotFoundException('Uno o más items (SurveyItem) no existen en la base de datos.');
        }

        return await this.userItemList.update({
            where: { id: listId },
            data: {
                items: {
                    connect: itemIds.map((id) => ({ id })),
                },
            },
            include: listIncludeItems,
        });
    }

    async removeOneItem(listId: UUID, itemId: UUID): Promise<UserItemList> {
        return await this.userItemList.update({
            where: { id: listId },
            data: {
                items: {
                    disconnect: { id: itemId },
                },
            },
            include: listIncludeItems,
        });
    }

    async removeAllItems(listId: UUID, itemIds: UUID[]): Promise<UserItemList> {
        return await this.userItemList.update({
            where: { id: listId },
            data: {
                items: {
                    disconnect: itemIds.map((id) => ({ id })),
                },
            },
            include: listIncludeItems,
        });
    }

    async getListItems(listId: UUID) {
        return await this.userItemList.findUnique({
            where: { id: listId },
            select: listIncludeItems,
        });
    }

    async isItemInList(listId: UUID, itemId: UUID): Promise<boolean> {
        const count = await this.userItemList.count({
            where: {
                id: listId,
                items: {
                    some: { id: itemId },
                },
            },
        });

        return count > 0;
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }
}
