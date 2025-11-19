import type { UUID } from 'crypto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, UserItemList } from '@prisma/client';

import { CreateUserItemListDto } from './dto/create-user-item-list.dto';
import { UpdateUserItemListDto } from './dto/update-user-item-list.dto';
import { PrismaService } from '../../../common/services/prisma.service';

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
export class UserItemListsService {
    private readonly logger: Logger;

    constructor(private readonly prisma: PrismaService) {
        this.logger = new Logger(this.constructor.name);
        this.logger.log('Initialized');
    }

    async findAll(ownerId: UUID): Promise<UserItemList[]> {
        return await this.prisma.userItemList.findMany({
            where: { ownerId },
            include: listIncludeItems,
        });
    }

    async findOne(id: UUID): Promise<UserItemList> {
        return await this.prisma.userItemList.findUniqueOrThrow({
            where: { id },
            include: listIncludeItems,
        });
    }

    async createList(ownerId: UUID, data: CreateUserItemListDto): Promise<UserItemList> {
        return this.prisma.userItemList.create({
            data: {
                ownerId,
                ...data,
            },
        });
    }

    async updateList(ownerId: UUID, id: UUID, data: UpdateUserItemListDto): Promise<UserItemList> {
        return await this.prisma.userItemList.update({
            where: { id, ownerId },
            data,
            include: listIncludeItems,
        });
    }

    async removeList(ownerId: UUID, id: UUID): Promise<UserItemList> {
        return await this.prisma.userItemList.delete({
            where: { id, ownerId },
        });
    }

    async appendOneItem(ownerId: UUID, listId: UUID, itemId: UUID): Promise<UserItemList> {
        await this.prisma.surveyItem.findUniqueOrThrow({ where: { id: itemId } });

        return await this.prisma.userItemList.update({
            where: { id: listId, ownerId },
            data: {
                items: {
                    connect: { id: itemId },
                },
            },
            include: listIncludeItems,
        });
    }

    async appendAllItems(ownerId: UUID, listId: UUID, itemIds: UUID[]): Promise<UserItemList> {
        const items = await this.prisma.surveyItem.findMany({
            where: { id: { in: itemIds } },
        });

        if (items.length !== itemIds.length) {
            throw new NotFoundException('Uno o más items (SurveyItem) no existen en la base de datos.');
        }

        return await this.prisma.userItemList.update({
            where: { id: listId, ownerId },
            data: {
                items: {
                    connect: itemIds.map((id) => ({ id })),
                },
            },
            include: listIncludeItems,
        });
    }

    async removeOneItem(ownerId: UUID, listId: UUID, itemId: UUID): Promise<UserItemList> {
        return await this.prisma.userItemList.update({
            where: { id: listId, ownerId },
            data: {
                items: {
                    disconnect: { id: itemId },
                },
            },
            include: listIncludeItems,
        });
    }

    async removeAllItems(ownerId: UUID, listId: UUID, itemIds: UUID[]): Promise<UserItemList> {
        return await this.prisma.userItemList.update({
            where: { id: listId, ownerId },
            data: {
                items: {
                    disconnect: itemIds.map((id) => ({ id })),
                },
            },
            include: listIncludeItems,
        });
    }

    async getListItems(ownerId: UUID, listId: UUID) {
        return await this.prisma.userItemList.findUnique({
            where: { id: listId, ownerId },
            select: listIncludeItems,
        });
    }

    async isItemInList(ownerId: UUID, listId: UUID, itemId: UUID): Promise<boolean> {
        const count = await this.prisma.userItemList.count({
            where: {
                id: listId,
                ownerId,
                items: {
                    some: { id: itemId },
                },
            },
        });

        return count > 0;
    }
}
