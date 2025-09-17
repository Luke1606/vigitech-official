import { AxiosInstance } from 'axios';
import { BaseExternalAPIClient } from '../base-external-api-fetcher.client';
import { OpenAlexResultDto } from '../../../dto/open-alex-result.dto';

export class OpenAlexAPIFetcher extends BaseExternalAPIClient {
    private static instance: OpenAlexAPIFetcher;

    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey, axiosInstance);
    }

    public static getInstance(
        axiosInstance?: AxiosInstance
    ): OpenAlexAPIFetcher {
        if (!OpenAlexAPIFetcher.instance)
            OpenAlexAPIFetcher.instance = new OpenAlexAPIFetcher(axiosInstance);
        return OpenAlexAPIFetcher.instance;
    }

    override specificFetch(objective: object): OpenAlexResultDto {
        console.log(objective);
        return {} as object;
    }
}
