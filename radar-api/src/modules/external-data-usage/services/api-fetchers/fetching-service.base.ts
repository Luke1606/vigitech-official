import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateSurveyItemDto } from '../../dto/create-survey-item.dto';
import { SurveyItemBasicData } from 'src/survey-items/types/survey-item-basic-data.type';
import { BaseExternalActor } from '../external-actor.base';

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

    abstract getTrendings(): Promise<CreateSurveyItemDto[] | undefined>;

    abstract getInfoFromItem(
        item: SurveyItemBasicData
    ): Promise<object | undefined>;
}
