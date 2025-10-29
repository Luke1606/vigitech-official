import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SurveyItem } from '@prisma/client';
import { BaseExternalActor } from '../external-actor.base';
import { CreateSurveyItemType } from '../../../data-management/survey-items/types/create-survey-item.type';

@Injectable()
export abstract class BaseFetchingService extends BaseExternalActor {
    protected constructor(
        protected readonly httpService: HttpService,
        protected readonly loggerName: string,
        protected readonly baseURL: string,
        protected readonly apiKey?: string,
    ) {
        super(httpService, loggerName, baseURL, apiKey);
    }

    abstract getTrendings(): Promise<CreateSurveyItemType[]>;

    abstract getInfoFromItem(item: SurveyItem): Promise<Record<string, unknown>>;
}
