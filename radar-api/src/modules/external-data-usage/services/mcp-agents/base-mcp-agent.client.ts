import { HttpService } from '@nestjs/axios';
import { BaseExternalActor } from '../external-actor.base';
import { GeneralSearchResult, SurveyItem } from '@prisma/client';
import { CreateMetricsType } from '../../types/create-analysis-metrics.type';

export abstract class BaseMCPAgent extends BaseExternalActor {
    protected constructor(
        protected readonly httpService: HttpService,
        protected readonly loggerName: string,
        protected readonly baseURL: string,
        protected readonly apiKey?: string,
    ) {
        super(httpService, loggerName, baseURL, apiKey);
    }

    abstract getMetricsFromItemData(item: SurveyItem, data: GeneralSearchResult): Promise<CreateMetricsType>;
}
