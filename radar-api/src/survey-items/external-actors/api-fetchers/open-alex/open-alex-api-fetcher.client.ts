import { BaseExternalAPIClient } from '../base-external-api-fetcher.client';
import { CreateSurveyItemDto } from 'src/survey-items/dto/create-survey-item.dto';
import { OpenAlexResultDto } from '../../../dto/api-results/open-alex-result.dto';
import { SurveyItemBasicData } from 'src/survey-items/types/survey-item-basic-data.type';

export class OpenAlexAPIFetcher extends BaseExternalAPIClient {
    private static instance: OpenAlexAPIFetcher;

    private constructor() {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey);
    }

    public static getInstance(): OpenAlexAPIFetcher {
        if (!OpenAlexAPIFetcher.instance)
            OpenAlexAPIFetcher.instance = new OpenAlexAPIFetcher();
        return OpenAlexAPIFetcher.instance;
    }

    getTrendings(): Promise<CreateSurveyItemDto[]> {
        throw new Error('Method not implemented.');
    }

    getInfoFromItem(_item: SurveyItemBasicData): Promise<OpenAlexResultDto> {
        throw new Error('Method not implemented.');
    }
}
