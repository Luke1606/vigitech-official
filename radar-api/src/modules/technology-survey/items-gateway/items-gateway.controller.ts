import type { UUID } from 'crypto';
import { Get, Body, Patch, Param, Logger, Delete, Controller, ParseUUIDPipe, Req } from '@nestjs/common';
import { UserSubscribedItem, UserHiddenItem, SurveyItem } from '@prisma/client';
import { ItemsGatewayService } from './items-gateway.service';
import type { AuthenticatedRequest } from '../../../shared/types/authenticated-request.type';
import { CreateItemDto } from './dto/create-item.dto';
import { ClassifiedItemType } from './types/classified-item.type';

@Controller('survey-items')
export class ItemsGatewayController {
    private readonly logger: Logger = new Logger('SurveyItemsController');

    constructor(private readonly surveyItemsService: ItemsGatewayService) {
        this.logger.log('Initialized');
    }

    @Get('recommended')
    async findAllRecommendations(@Req() request: AuthenticatedRequest): Promise<ClassifiedItemType[]> {
        this.logger.log('Executed findAllRecommendations');
        const userId: UUID = request.userId as UUID;
        return await this.surveyItemsService.findAllRecommended(userId);
    }

    @Get('subscribed')
    async findAllSubscribed(@Req() request: AuthenticatedRequest): Promise<ClassifiedItemType[]> {
        this.logger.log('Executed findAllSubscribed');
        const userId: UUID = request.userId as UUID;
        return await this.surveyItemsService.findAllSubscribed(userId);
    }

    @Get(':id')
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: UUID,
        @Req() request: AuthenticatedRequest,
    ): Promise<ClassifiedItemType> {
        this.logger.log('Executed findOne');
        const userId: UUID = request.userId as UUID;
        return await this.surveyItemsService.findOne(id, userId);
    }

    @Patch('create')
    async create(@Body() data: CreateItemDto, @Req() request: AuthenticatedRequest): Promise<SurveyItem> {
        this.logger.log('Executed create');
        const userId: UUID = request.userId as UUID;
        return await this.surveyItemsService.create(data, userId);
    }

    @Patch('subscribe/:id')
    async subscribe(
        @Param('id', new ParseUUIDPipe()) id: UUID,
        @Req() request: AuthenticatedRequest,
    ): Promise<UserSubscribedItem> {
        this.logger.log('Executed subscribe');
        const userId: UUID = request.userId as UUID;
        return await this.surveyItemsService.subscribeOne(id, userId);
    }

    @Patch('unsubscribe/:id')
    async unsubscribe(@Param('id', new ParseUUIDPipe()) id: UUID, @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed unsubscribe');
        const userId: UUID = request.userId as UUID;
        return await this.surveyItemsService.unsubscribeOne(id, userId);
    }

    @Delete(':id')
    async remove(
        @Param('id', new ParseUUIDPipe()) id: UUID,
        @Req() request: AuthenticatedRequest,
    ): Promise<UserHiddenItem> {
        this.logger.log('Executed remove');
        const userId: UUID = request.userId as UUID;
        return await this.surveyItemsService.removeOne(id, userId);
    }

    @Patch('create/batch')
    async createBatch(@Body() data: CreateItemDto[], @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed create');
        const userId: UUID = request.userId as UUID;
        return await this.surveyItemsService.createBatch(data, userId);
    }

    @Patch('subscribe/batch')
    async subscribeBatch(@Body() itemIds: UUID[], @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed subscribeBatch');
        const userId: UUID = request.userId as UUID;
        return await this.surveyItemsService.subscribeBatch(itemIds, userId);
    }

    @Patch('unsubscribe/batch')
    async unsubscribeBatch(@Body() itemIds: UUID[], @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed unsubscribeBatch');
        const userId: UUID = request.userId as UUID;
        return await this.surveyItemsService.unsubscribeBatch(itemIds, userId);
    }

    @Delete('batch')
    async removeBatch(@Body() itemIds: UUID[], @Req() request: AuthenticatedRequest): Promise<void> {
        this.logger.log('Executed removeBatch');
        const userId: UUID = request.userId as UUID;
        return await this.surveyItemsService.removeBatch(itemIds, userId);
    }
}
