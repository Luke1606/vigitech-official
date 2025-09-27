import type { UUID } from 'crypto';
import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { SuperTokensAuthGuard } from 'supertokens-nestjs';

import { UserItemList } from '@prisma/client';
import { UserItemListsService } from './user-item-lists.service';
import { CreateUserItemListDto } from './dto/create-user-item-list.dto';
import { UpdateUserItemListDto } from './dto/update-user-item-list.dto';

@Controller('item-lists')
@UseGuards(SuperTokensAuthGuard)
export class UserItemListsController {
    private readonly logger: Logger = new Logger('UserItemListsController');

    constructor(private readonly userItemListsService: UserItemListsService) {
        this.logger.log('Initialized');
    }

    @Get()
    async findAll(): Promise<UserItemList[]> {
        return await this.userItemListsService.findAll();
    }

    @Get(':id')
    async findOne(
        @Param(':id', ParseUUIDPipe) id: UUID
    ): Promise<UserItemList> {
        return await this.userItemListsService.findOne(id);
    }

    @Post()
    create(@Body() data: CreateUserItemListDto): Promise<UserItemList> {
        return this.userItemListsService.create(data);
    }

    @Patch(':listId')
    async appendOneItem(
        @Param(':listId') listId: UUID,
        @Body() itemId: UUID
    ): Promise<UserItemList> {
        return await this.userItemListsService.appendOneItem(listId, itemId);
    }

    @Patch(':listId')
    async appendAllItems(
        @Param(':listId') id: UUID,
        @Body() itemIds: UUID[]
    ): Promise<UserItemList> {
        return await this.userItemListsService.appendAllItems(id, itemIds);
    }

    @Patch(':id')
    async update(
        @Param(':id', ParseUUIDPipe) id: UUID,
        @Body() data: UpdateUserItemListDto
    ): Promise<UserItemList> {
        return await this.userItemListsService.update(id, data);
    }

    @Patch(':listId')
    async removeOneItem(
        @Param(':listId') listId: UUID,
        @Body() itemId: UUID
    ): Promise<UserItemList> {
        return await this.userItemListsService.removeOneItem(listId, itemId);
    }

    @Patch(':listId')
    async removeAllItems(
        @Param(':listId') id: UUID,
        @Body() itemIds: UUID[]
    ): Promise<UserItemList> {
        return await this.userItemListsService.removeAllItems(id, itemIds);
    }

    @Delete(':id')
    async remove(@Param(':id', ParseUUIDPipe) id: UUID): Promise<UserItemList> {
        return await this.userItemListsService.remove(id);
    }
}
