import type { UUID } from 'crypto';
import {
    Controller,
    Logger,
    Param,
    Body,
    Delete,
    Get,
    Patch,
    ParseUUIDPipe,
} from '@nestjs/common';

import { SurveyItem } from '@prisma/client';
import { SurveyItemsService } from './survey-items.service';
import { SurveyItemWithAnalysisType } from './types/survey-item-with-analysis.type';

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
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: UUID
    ): Promise<SurveyItemWithAnalysisType> {
        this.logger.log('Executed findOne');
        return await this.surveyItemsService.findOne(id);
    }

    @Patch('subscribe/:id')
    async subscribe(
        @Param('id', new ParseUUIDPipe()) id: UUID
    ): Promise<SurveyItem> {
        return await this.surveyItemsService.subscribeOne(id);
    }

    @Patch('unsubscribe/:id')
    async unsubscribe(
        @Param('id', new ParseUUIDPipe()) id: UUID
    ): Promise<SurveyItem> {
        return await this.surveyItemsService.unsubscribeOne(id);
    }

    @Delete(':id')
    async remove(
        @Param('id', new ParseUUIDPipe()) id: UUID
    ): Promise<SurveyItem> {
        this.logger.log('Executed remove');
        return await this.surveyItemsService.removeOne(id);
    }

    @Patch('subscribe/batch')
    async subscribeBatch(@Body() itemIds: UUID[]): Promise<void> {
        return await this.surveyItemsService.subscribeBatch(itemIds);
    }

    @Patch('unsubscribe/batch')
    async unsubscribeBatch(@Body() itemIds: UUID[]): Promise<void> {
        return await this.surveyItemsService.unsubscribeBatch(itemIds);
    }

    @Delete('batch')
    async removeBatch(@Body() itemIds: UUID[]): Promise<void> {
        this.logger.log('Executed remove');
        return await this.surveyItemsService.removeBatch(itemIds);
    }
}
