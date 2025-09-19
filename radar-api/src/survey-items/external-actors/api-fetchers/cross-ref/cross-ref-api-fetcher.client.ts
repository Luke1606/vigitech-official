import { BaseExternalAPIClient } from '../base-external-api-fetcher.client';
import { CreateSurveyItemDto } from 'src/survey-items/dto/create-survey-item.dto';
import { CrossRefResultDto } from '../../../dto/api-results/cross-ref-result.dto';
import { SurveyItemBasicData } from '../../../types/survey-item-basic-data.type';

export class CrossRefAPIFetcher extends BaseExternalAPIClient {
    private static instance: CrossRefAPIFetcher;

    private constructor() {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey);
    }

    public static getInstance(): CrossRefAPIFetcher {
        if (!CrossRefAPIFetcher.instance)
            CrossRefAPIFetcher.instance = new CrossRefAPIFetcher();
        return CrossRefAPIFetcher.instance;
    }

    getTrendings(): Promise<CreateSurveyItemDto[]> {
        throw new Error('Method not implemented.');
    }

    getInfoFromItem(_item: SurveyItemBasicData): Promise<CrossRefResultDto> {
        throw new Error('Method not implemented.');
    }
}
