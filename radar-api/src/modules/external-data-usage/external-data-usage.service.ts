import { Injectable, Logger } from '@nestjs/common';
import {
    CrossRefService,
    OpenAlexService,
    UnpaywallService,
} from './services/api-fetchers';
import { SurveyItemWithAnalysis } from '../survey-items/types/survey-item-with-analysis.type';
import { SubscribedItemAnalysis } from '@prisma/client';
import { CreateSurveyItemDto } from '../survey-items/dto/create-survey-item.dto';
import { SurveyItemBasicData } from '../survey-items/types/survey-item-basic-data.type';
import { CrossRefResponse } from './types/cross-ref-responses.type';
import { OpenAlexResponse } from './types/open-alex-responses.type';
import { UnpaywallResponse } from './types/unpaywall-result.type';
import { GeneralSearchResponse } from './types/general-search-response.type';
import { Metrics } from './types/analysis-metrics.type';

@Injectable()
export class ExternalDataUsageService {
    private readonly logger: Logger = new Logger('ExternalDataUsageService');

    constructor(
        private readonly crossRefFetcher: CrossRefService,
        private readonly unpaywallFetcher: UnpaywallService,
        private readonly openAlexFetcher: OpenAlexService
    ) {}
    

    async getNewTrendings(): Promise<SurveyItemWithAnalysis[]> {
        this.logger.log('Executed getNewTrendings');

        // se obtienen las tendencias de cada api
        const crossRefTrendings = await this.crossRefFetcher.getTrendings();

        const openAlexTrendings = await this.openAlexFetcher.getTrendings();

        const unpaywallTrendings = await this.unpaywallFetcher.getTrendings();

        const trendingsBeforeFetching: SurveyItemBasicData[] = [
            ...crossRefTrendings,
            ...openAlexTrendings,
            ...unpaywallTrendings,
        ];
        // Se recorre el array obteniendo el analisis de cada uno para guardarlos juntos
        const trendings: CreateSurveyItemDto[] = [];

        for (let index = 0; index < trendingsBeforeFetching.length; index++) {
            const item = trendingsBeforeFetching[index];

            const lastAnalysis: SubscribedItemAnalysis =
                await this.getAnalysisFromSurveyItem(item);

            trendings.push({
                ...item,
                lastAnalysis,
            });
        }

        return trendings;
    }

    private async getAnalysisFromSurveyItem(
        item: SurveyItemBasicData
    ): Promise<CreateItemAnalysisDto> {
        const searchedData: GeneralSearchResponse =
            await this.getSurveyItemData(item);

        const analyzedMetrics: Metrics =
            await this.getSurveyItemMetricsFromData(item, searchedData);

        return {
            itemId: item.id,
            searchedData,
            analyzedMetrics,
        };
    }

    private async getSurveyItemData(
        item: SurveyItemBasicData
    ): Promise<GeneralSearchResponse> {
        const crossRefResults: CrossRefResponse | undefined =
            await this.crossRefFetcher.getInfoFromItem(item);

        const openAlexResults: OpenAlexResponse | undefined =
            await this.openAlexFetcher.getInfoFromItem(item);

        const unpaywallResults: UnpaywallResponse | undefined =
            await this.unpaywallFetcher.getInfoFromItem(item);

        return {
            crossRefResults,
            openAlexResults,
            unpaywallResults,
        } as unknown as GeneralSearchResponse;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    private async getSurveyItemMetricsFromData(
        _item: SurveyItemBasicData,
        _data: GeneralSearchResponse
    ): Promise<Metrics> {
        return {} as Metrics;
    }
}
