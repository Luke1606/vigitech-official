import { GeneralSearchResultDto } from '../../dto/general-search-result.dto';
import { MetricsDto } from '../../dto/analysis-metrics.dto';
import { SurveyItemBasicData } from '../../types/survey-item-basic-data.type';
import { HttpService } from '@nestjs/axios';
import { BaseExternalActor } from '../external-actor.base';

export abstract class BaseMCPAgent extends BaseExternalActor {
    protected constructor(
        protected readonly httpService: HttpService,
        protected readonly loggerName: string,
        protected readonly baseURL: string,
        protected readonly apiKey?: string
    ) {
        super(httpService, loggerName, baseURL, apiKey);
    }

    abstract getMetricsFromItemData(
        item: SurveyItemBasicData,
        data: GeneralSearchResultDto
    ): Promise<MetricsDto>;
}
