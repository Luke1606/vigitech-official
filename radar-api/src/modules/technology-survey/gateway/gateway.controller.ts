import type { UUID } from 'crypto';
import { Get, Body, Patch, Param, Logger, Delete, Controller, ParseUUIDPipe, Req, Post } from '@nestjs/common';
import { UserSubscribedItem, Item } from '@prisma/client';
import type { AuthenticatedRequest } from '@/shared/types/authenticated-request.type';
import { ItemsGatewayService } from './gateway.service';
import { CreateUnclassifiedItemDto } from '../shared/dto/create-unclassified-item.dto';

@Controller('tech-survey/survey-items')
export class ItemsGatewayController {
    private readonly logger: Logger = new Logger('SurveyItemsController');

    constructor(private readonly itemsService: ItemsGatewayService) {
        this.logger.log('Initialized');
    }

    @Get('recommended')
    async findAllRecommendations(@Req() request: AuthenticatedRequest): Promise<Item[]> {
        this.logger.log('Executed findAllRecommendations');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.findAllRecommended(userId);
    }

    @Get('subscribed')
    async findAllSubscribed(@Req() request: AuthenticatedRequest): Promise<Item[]> {
        this.logger.log('Executed findAllSubscribed');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.findAllSubscribed(userId);
    }

    @Get(':id')
    async findOne(@Param('id', new ParseUUIDPipe()) id: UUID, @Req() request: AuthenticatedRequest): Promise<Item> {
        this.logger.log('Executed findOne');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.findOne(id, userId);
    }

    @Post('create')
    async create(@Body() data: CreateUnclassifiedItemDto, @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed create');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.create(data, userId);
    }

    @Patch('subscribe/:id')
    async subscribe(
        @Param('id', new ParseUUIDPipe()) id: UUID,
        @Req() request: AuthenticatedRequest,
    ): Promise<UserSubscribedItem> {
        this.logger.log('Executed subscribe');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.subscribeOne(id, userId);
    }

    @Patch('unsubscribe/:id')
    async unsubscribe(@Param('id', new ParseUUIDPipe()) id: UUID, @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed unsubscribe');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.unsubscribeOne(id, userId);
    }

    @Delete(':id')
    async remove(@Param('id', new ParseUUIDPipe()) id: UUID, @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed remove');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.removeOne(id, userId);
    }

    @Patch('create/batch')
    async createBatch(@Body() data: CreateUnclassifiedItemDto[], @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed create');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.createBatch(data, userId);
    }

    @Patch('subscribe/batch')
    async subscribeBatch(@Body() itemIds: UUID[], @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed subscribeBatch');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.subscribeBatch(itemIds, userId);
    }

    @Patch('unsubscribe/batch')
    async unsubscribeBatch(@Body() itemIds: UUID[], @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed unsubscribeBatch');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.unsubscribeBatch(itemIds, userId);
    }

    @Delete('batch')
    async removeBatch(@Body() itemIds: UUID[], @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed removeBatch');
        const userId: UUID = request.userId as UUID;
        return await this.itemsService.removeBatch(itemIds, userId);
    }
}
