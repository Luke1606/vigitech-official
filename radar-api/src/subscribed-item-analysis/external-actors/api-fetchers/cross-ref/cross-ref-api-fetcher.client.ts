import { AxiosInstance } from 'axios';
import { SurveyItem } from '@prisma/client';
import { BaseExternalAPIClient } from '../base-external-api-fetcher.client';
import { CrossRefResultDto } from '../../../dto/cross-ref-result.dto';

export class CrossRefAPIFetcher extends BaseExternalAPIClient {
    private static instance: CrossRefAPIFetcher;

    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey, axiosInstance);
    }

    public static getInstance(
        axiosInstance?: AxiosInstance
    ): CrossRefAPIFetcher {
        if (!CrossRefAPIFetcher.instance)
            CrossRefAPIFetcher.instance = new CrossRefAPIFetcher(axiosInstance);
        return CrossRefAPIFetcher.instance;
    }

    override specificFetch(objective: SurveyItem): CrossRefResultDto {
        console.log(objective);
        return {} as CrossRefResultDto;
    }
}
