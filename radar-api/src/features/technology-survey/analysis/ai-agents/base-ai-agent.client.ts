import { HttpService } from '@nestjs/axios';
import { BaseExternalActor } from '../external-actor.base';
import { SurveyItem } from '@prisma/client';
import { CreateInsightType } from '../../types/create-insight.type';

export abstract class BaseMCPAgent extends BaseExternalActor {
    protected constructor(
        protected readonly httpService: HttpService,
        protected readonly loggerName: string,
        protected readonly baseURL: string,
        protected readonly apiKey?: string,
    ) {
        super(httpService, loggerName, baseURL, apiKey);
    }

    abstract getInsightsFromMetadata(item: SurveyItem, metadata: Record<string, unknown>): Promise<CreateInsightType>;
}
