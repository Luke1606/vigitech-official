import type { UUID } from 'crypto';
import { Controller, Delete, Get, Logger, Param, ParseUUIDPipe, Patch } from '@nestjs/common';

import { SurveyItem } from '@prisma/client';
import { SurveyItemsService } from './survey-items.service';

@Controller('survey-items')
export class SurveyItemsController {
	private readonly logger: Logger = new Logger('SurveyItemsController');

	constructor (
		private readonly surveyItemsService: SurveyItemsService
	) {
		this.logger.log('Initialized');
	}
	
	@Get('recommended')
	async findAllRecommendations (): Promise<SurveyItem[]> {
		this.logger.log('Executed findAll');
		return await this.surveyItemsService.findAllRecommendations();
	}

	@Get('subscribed')
	async findAllSubscribed (): Promise<SurveyItem[]> {
		this.logger.log('Executed findAll');
		return await this.surveyItemsService.findAllSubscribed();
	}

	@Get(':id')
	async findOne (
		@Param(':id', ParseUUIDPipe) id: UUID
	): Promise<SurveyItem> {
		this.logger.log('Executed findOne');
		return await this.surveyItemsService.findOne(id);
	}

	@Patch('subscribe/:id')
	subscribe (
		@Param(':id', ParseUUIDPipe) id: UUID
	): Promise<SurveyItem> {
		return this.surveyItemsService.subscribe(id);
	}

	@Patch('unsubscribe/:id')
	unsubscribe (
		@Param(':id', ParseUUIDPipe) id: UUID
	): Promise<SurveyItem> {
		return this.surveyItemsService.unsubscribe(id);
	}

	@Delete(':id')
	async remove (
		@Param(':id', ParseUUIDPipe) id: UUID
	): Promise<SurveyItem> {
		this.logger.log('Executed remove');
		return await this.surveyItemsService.remove(id);
	}
}
