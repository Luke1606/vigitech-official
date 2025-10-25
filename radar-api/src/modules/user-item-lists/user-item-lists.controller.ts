import type { UUID } from 'crypto';
import { Body, Controller, Delete, Get, Logger, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';

import { UserItemList } from '@prisma/client';
import { UserItemListsService } from './user-item-lists.service';
import { CreateUserItemListDto } from './dto/create-user-item-list.dto';
import { UpdateUserItemListDto } from './dto/update-user-item-list.dto';
import type { AuthenticatedRequest } from '../../shared/types/authenticated-request.type';

@Controller('item-lists')
export class UserItemListsController {
    private readonly logger: Logger = new Logger('UserItemListsController');

    constructor(private readonly userItemListsService: UserItemListsService) {
        this.logger.log('Initialized');
    }

    @Get()
    async findAll(@Req() request: AuthenticatedRequest): Promise<UserItemList[]> {
        const userId: UUID = request.userId as UUID;
        return await this.userItemListsService.findAll(userId);
    }

    @Get(':id')
    async findOne(@Param(':id', ParseUUIDPipe) id: UUID): Promise<UserItemList> {
        return await this.userItemListsService.findOne(id);
    }

    @Post()
    createList(@Body() data: CreateUserItemListDto, @Req() request: AuthenticatedRequest): Promise<UserItemList> {
        const userId: UUID = request.userId as UUID;
        return this.userItemListsService.createList(userId, data);
    }

    @Patch(':id')
    async updateList(
        @Param(':id', ParseUUIDPipe) id: UUID,
        @Body() data: UpdateUserItemListDto,
    ): Promise<UserItemList> {
        return await this.userItemListsService.updateList(id, data);
    }

    @Delete(':id')
    async removeList(@Param(':id', ParseUUIDPipe) id: UUID): Promise<UserItemList> {
        return await this.userItemListsService.removeList(id);
    }

    @Patch(':listId')
    async appendOneItem(@Param(':listId') listId: UUID, @Body() itemId: UUID): Promise<UserItemList> {
        return await this.userItemListsService.appendOneItem(listId, itemId);
    }

    @Patch('batch/:listId')
    async appendAllItems(@Param(':listId') id: UUID, @Body() itemIds: UUID[]): Promise<UserItemList> {
        return await this.userItemListsService.appendAllItems(id, itemIds);
    }

    @Patch(':listId')
    async removeOneItem(@Param(':listId') listId: UUID, @Body() itemId: UUID): Promise<UserItemList> {
        return await this.userItemListsService.removeOneItem(listId, itemId);
    }

    @Patch('batch/:listId')
    async removeAllItems(@Param(':listId') id: UUID, @Body() itemIds: UUID[]): Promise<UserItemList> {
        return await this.userItemListsService.removeAllItems(id, itemIds);
    }
}
