/* eslint-disable @typescript-eslint/require-await */
import type { UUID } from 'crypto';
import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';

import { CreateUserItemListDto } from './dto/create-user-item-list.dto';
import { PrismaClient, UserItemList } from '@prisma/client';
import { UpdateUserItemListDto } from './dto/update-user-item-list.dto';

@Injectable()
export class UserItemListsService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger: Logger = new Logger('UserItemListService');

    async onModuleInit(): Promise<void> {
        await this.$connect();
        this.logger.log('Initialized and connected to database');
    }

    async findAll(): Promise<UserItemList[]> {
        return await this.userItemList.findMany();
    }

    async findOne(id: UUID): Promise<UserItemList> {
        return await this.userItemList.findUniqueOrThrow({ where: { id } });
    }

    async create(data: CreateUserItemListDto): Promise<UserItemList> {
        return this.userItemList.create({
            data: {
                ...data,
            },
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async appendOneItem(id: UUID, itemId: UUID): Promise<UserItemList> {
        return {} as UserItemList;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async appendAllItems(listId: UUID, itemIds: UUID[]): Promise<UserItemList> {
        return {} as UserItemList;
    }

    async update(id: UUID, data: UpdateUserItemListDto): Promise<UserItemList> {
        return await this.userItemList.update({
            where: { id },
            data,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async removeOneItem(id: UUID, itemId: UUID): Promise<UserItemList> {
        return {} as UserItemList;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async removeAllItems(listId: UUID, itemIds: UUID[]): Promise<UserItemList> {
        return {} as UserItemList;
    }

    async remove(id: UUID): Promise<UserItemList> {
        return await this.userItemList.delete({
            where: { id },
        });
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }
}
