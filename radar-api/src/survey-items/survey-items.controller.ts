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
} from '@nestjs/common';

import { SurveyItem } from '@prisma/client';
import { SurveyItemsService } from './survey-items.service';

@Controller('survey-items')
export class SurveyItemsController {
    private readonly logger: Logger = new Logger('SurveyItemsController');

    constructor(private readonly surveyItemsService: SurveyItemsService) {
        this.logger.log('Initialized');
    }

    @Get('recommended')
    async findAllRecommendations(): Promise<SurveyItem[]> {
        this.logger.log('Executed findAll');
        return await this.surveyItemsService.findAllRecommended();
    }

    @Get('subscribed')
    async findAllSubscribed(): Promise<SurveyItem[]> {
        this.logger.log('Executed findAll');
        return await this.surveyItemsService.findAllSubscribed();
    }

    @Get(':id')
    async findOne(@Param(':id', ParseUUIDPipe) id: UUID): Promise<SurveyItem> {
        this.logger.log('Executed findOne');
        return await this.surveyItemsService.findOne(id);
    }

    @Patch('subscribe/:id')
    subscribe(@Param(':id', ParseUUIDPipe) id: UUID): Promise<SurveyItem> {
        return this.surveyItemsService.subscribeOne(id);
    }

    @Patch('unsubscribe/:id')
    unsubscribe(@Param(':id', ParseUUIDPipe) id: UUID): Promise<SurveyItem> {
        return this.surveyItemsService.unsubscribeOne(id);
    }

    @Delete(':id')
    async remove(@Param(':id', ParseUUIDPipe) id: UUID): Promise<SurveyItem> {
        this.logger.log('Executed remove');
        return await this.surveyItemsService.removeOne(id);
    }

    @Patch('subscribe/batch')
    subscribeBatch(@Body() itemIds: UUID[]): Promise<void> {
        return this.surveyItemsService.subscribeBatch(itemIds);
    }

    @Patch('unsubscribe/batch')
    unsubscribeBatch(@Body() itemIds: UUID[]): Promise<void> {
        return this.surveyItemsService.unsubscribeBatch(itemIds);
    }

    @Delete('batch')
    async removeBatch(@Body() itemIds: UUID[]): Promise<void> {
        this.logger.log('Executed remove');
        return await this.surveyItemsService.removeBatch(itemIds);
    }
}
