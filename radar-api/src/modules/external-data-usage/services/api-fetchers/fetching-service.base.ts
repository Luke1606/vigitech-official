import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { BaseExternalActor } from '../external-actor.base';
import { CreateSurveyItemType } from 'src/modules/survey-items/types/create-survey-item.type';
import { SurveyItem } from '@prisma/client';

@Injectable()
export abstract class BaseFetchingService extends BaseExternalActor {
    protected constructor(
        protected readonly httpService: HttpService,
        protected readonly loggerName: string,
        protected readonly baseURL: string,
        protected readonly apiKey?: string
    ) {
        super(httpService, loggerName, baseURL, apiKey);
    }

    abstract getTrendings(): Promise<CreateSurveyItemType[]>;

    abstract getInfoFromItem(item: SurveyItem): Promise<object>;
}
