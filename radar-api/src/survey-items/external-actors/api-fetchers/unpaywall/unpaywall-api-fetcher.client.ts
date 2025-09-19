import { BaseExternalAPIClient } from '../base-external-api-fetcher.client';
import { CreateSurveyItemDto } from 'src/survey-items/dto/create-survey-item.dto';
import { UnpaywallResultDto } from '../../../dto/api-results/unpaywall-result.dto';
import { SurveyItemBasicData } from 'src/survey-items/types/survey-item-basic-data.type';

export class UnpaywallAPIFetcher extends BaseExternalAPIClient {
    private static instance: UnpaywallAPIFetcher;

    private constructor() {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey);
    }

    public static getInstance(): UnpaywallAPIFetcher {
        if (!UnpaywallAPIFetcher.instance)
            UnpaywallAPIFetcher.instance = new UnpaywallAPIFetcher();
        return UnpaywallAPIFetcher.instance;
    }

    getTrendings(): Promise<CreateSurveyItemDto[]> {
        throw new Error('Method not implemented.');
    }

    getInfoFromItem(_item: SurveyItemBasicData): Promise<UnpaywallResultDto> {
        throw new Error('Method not implemented.');
    }
}
