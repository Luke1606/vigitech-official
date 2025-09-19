import { BaseExternalAPIClient } from '../base-external-api-fetcher.client';
import { CreateSurveyItemDto } from 'src/survey-items/dto/create-survey-item.dto';
import { LensResultDto } from '../../../dto/api-results/lens-result.dto';
import { SurveyItemBasicData } from 'src/survey-items/types/survey-item-basic-data.type';

export class LensAPIFetcher extends BaseExternalAPIClient {
    private static instance: LensAPIFetcher;

    private constructor() {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey);
    }

    public static getInstance(): LensAPIFetcher {
        if (!LensAPIFetcher.instance)
            LensAPIFetcher.instance = new LensAPIFetcher();
        return LensAPIFetcher.instance;
    }

    getTrendings(): Promise<CreateSurveyItemDto[]> {
        throw new Error('Method not implemented.');
    }

    getInfoFromItem(_item: SurveyItemBasicData): Promise<LensResultDto> {
        throw new Error('Method not implemented.');
    }
}
