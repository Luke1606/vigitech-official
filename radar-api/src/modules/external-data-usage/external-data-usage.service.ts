/* eslint-disable prettier/prettier */
import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';

import {
    Metrics,
    PrismaClient,
    SurveyItem,
    GeneralSearchResult,
    Trending,
    AccesibilityLevel,
} from '@prisma/client';

import {
    CrossRefService,
    OpenAlexService,
    UnpaywallService,
} from './services/api-fetchers';

import { CreateSurveyItemType } from '../survey-items/types/create-survey-item.type';
import { CrossRefResponse } from './types/api-responses/scientific-stage/cross-ref-responses.type';
import { OpenAlexResponse } from './types/api-responses/scientific-stage/open-alex-responses.type';
import { UnpaywallResponse } from './types/unpaywall-responsestype';

import {
    ChatGPTAgent,
    ClaudeAgent,
    CodeGPTAgent,
    DeepseekAgent,
    GeminiAgent,
    GrokAgent,
} from './services/mcp-agents';
import { CreateMetricsType } from './types/create-analysis-metrics.type';

@Injectable()
export class ExternalDataUsageService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger: Logger = new Logger('ExternalDataUsageService');

    constructor(
        private readonly crossRefFetcher: CrossRefService,
        private readonly unpaywallFetcher: UnpaywallService,
        private readonly openAlexFetcher: OpenAlexService,
        private readonly chatGPTAgent: ChatGPTAgent,
        private readonly claudeAgent: ClaudeAgent,
        private readonly codeGPTAgent: CodeGPTAgent,
        private readonly deepseekAgent: DeepseekAgent,
        private readonly geminiAgent: GeminiAgent,
        private readonly grokAgent: GrokAgent
    ) {
        super();
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Initialized and connected to database');
    }

    async getNewTrendings(): Promise<CreateSurveyItemType[]> {
        this.logger.log('Executed getNewTrendings');

        // se obtienen las tendencias de cada api
        const crossRefTrendings: CreateSurveyItemType[] =
            await this.crossRefFetcher.getTrendings();

        const openAlexTrendings: CreateSurveyItemType[] =
            await this.openAlexFetcher.getTrendings();

        const unpaywallTrendings: CreateSurveyItemType[] =
            await this.unpaywallFetcher.getTrendings();

        return [
            ...crossRefTrendings,
            ...openAlexTrendings,
            ...unpaywallTrendings,
        ] as CreateSurveyItemType[];
    }

    async getSurveyItemData(item: SurveyItem): Promise<GeneralSearchResult> {
        const crossRefResult: CrossRefResponse | undefined =
            await this.crossRefFetcher.getInfoFromItem(item);

        const openAlexResult: OpenAlexResponse | undefined =
            await this.openAlexFetcher.getInfoFromItem(item);

        const unpaywallResult: UnpaywallResponse | undefined =
            await this.unpaywallFetcher.getInfoFromItem(item);

        return await this.generalSearchResult.create({
            data: {
                crossRefResult: crossRefResult as unknown as object,
                openAlexResult: openAlexResult as unknown as object,
                unpaywallResult: unpaywallResult as unknown as object,
            },
        });
    }

    async getSurveyItemMetricsFromData(
        item: SurveyItem,
        data: GeneralSearchResult
    ): Promise<Metrics> {
        const chatGptMetrics: CreateMetricsType = await this.chatGPTAgent.getMetricsFromItemData(
            item,
            data
        );
        const _claudeMetrics: CreateMetricsType = await this.claudeAgent.getMetricsFromItemData(
            item,
            data
        );
        const _codeGptMetrics: CreateMetricsType = await this.codeGPTAgent.getMetricsFromItemData(
            item,
            data
        );
        const _deepseekMetrics: CreateMetricsType =
            await this.deepseekAgent.getMetricsFromItemData(item, data);

        const _geminiMetrics: CreateMetricsType = await this.geminiAgent.getMetricsFromItemData(
            item,
            data
        );
        const _grokMetrics: CreateMetricsType = await this.grokAgent.getMetricsFromItemData(
            item,
            data
        );

        const citations: number = chatGptMetrics.citations;
        const downloads: number = chatGptMetrics.downloads;
        const relevance: number = chatGptMetrics.relevance;
        const trending: Trending = chatGptMetrics.trending;
        const accesibilityLevel: AccesibilityLevel =
            chatGptMetrics.accesibilityLevel;

        return await this.metrics.create({
            data: {
                citations,
                downloads,
                relevance,
                trending,
                accesibilityLevel,
            },
        });
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }
}
