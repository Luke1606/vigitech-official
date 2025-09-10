import { UUID } from 'crypto';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient, SubscribedItemAnalysis, SurveyItem } from '@prisma/client';

import { CreateItemAnalysisDto } from './dto/create-item-analysis.dto';
import { GeneralSearchResultDto } from './dto/general-search-result.dto';
import { MetricsDto } from './dto/analysis-metrics.dto';
import { AccesibilityLevel, Trending } from './enum/item-analysis-options';
import { CrossRefResultDto } from './dto/cross-ref-result.dto';
import { LensResultDto } from './dto/lens-result.dto';
import { OpenAlexResultDto } from './dto/open-alex-result.dto';
import { UnpaywallResultDto } from './dto/unpaywall-result.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Injectable()
export class SubscribedItemAnalysisService extends PrismaClient implements OnModuleInit, OnModuleDestroy{
	private readonly logger: Logger = new Logger('SubscribedItemAnalysisService');

	async onModuleInit() {
		await this.$connect();
		this.logger.log('Initialized and connected to database');
	};

	async analyzeAll () {
		// obtiene todos los following items
		// items.forEach((item) => this.analyzeOne(item))
		return;
	}

	async analyzeOne (item: SurveyItem) {
		// realiza busquedas a las apis
		// obtiene metricas de los agentes
		this.logger.log(item);

		const searchedData: GeneralSearchResultDto = {
			crossRefResults: {} as CrossRefResultDto,
			openAlexResults: {} as OpenAlexResultDto,
			unpaywallResults: {} as UnpaywallResultDto,
			lensResults: {} as LensResultDto
		} as GeneralSearchResultDto;
		
		const obtainedMetrics: MetricsDto = {
			citations: 1,
			downloads: 1,
			relevance: 1,
			accesibilityLevel: AccesibilityLevel.FREE,
			trending: Trending.UNSTABLE,
		} as MetricsDto;

		const raw = {
		    searchedData,
    		obtainedMetrics,
    		itemId: item.id,
  		};

		const dto = plainToInstance(CreateItemAnalysisDto, raw);

  		await validateOrReject(dto);

	    const searchedJson = JSON.parse(JSON.stringify(searchedData));
	    const metricsJson = JSON.parse(JSON.stringify(obtainedMetrics));

		const data: Prisma.SubscribedItemAnalysisCreateInput = {
      		searchedData: searchedJson as Prisma.InputJsonValue,
      		obtainedMetrics: metricsJson as Prisma.InputJsonValue,
			item: item,
    	};
		return this.subscribedItemAnalysis.create({ data });
	}

	async findAllInsideIntervalFromObjective(itemId: UUID, startDate: Date, endDate: Date) {
		return await this.subscribedItemAnalysis
			.findMany({
				where: { itemId },
				orderBy: { createdAt: 'asc' }
			})
			.then(
				(analysisFromItem: SubscribedItemAnalysis[]) => 
					analysisFromItem.filter((analysis) => 
						analysis.createdAt > startDate && analysis.createdAt < endDate)
			);
	}

	async findLastFromItem (itemId: UUID) {
		return await this.subscribedItemAnalysis.findFirstOrThrow({
			where: { itemId },
			orderBy: { searchedData: 'desc' }
		});
	}	

	async onModuleDestroy() {
		await this.$disconnect();
		this.logger.log('Disconnected from database');
	};
}
