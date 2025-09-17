import { AxiosInstance } from 'axios';
import { BaseExternalAPIClient } from '../base-external-api-fetcher.client';
import { UnpaywallResultDto } from '../../../dto/unpaywall-result.dto';

export class UnpaywallAPIFetcher extends BaseExternalAPIClient {
    private static instance: UnpaywallAPIFetcher;

    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey, axiosInstance);
    }

    public static getInstance(
        axiosInstance?: AxiosInstance
    ): UnpaywallAPIFetcher {
        if (!UnpaywallAPIFetcher.instance)
            UnpaywallAPIFetcher.instance = new UnpaywallAPIFetcher(
                axiosInstance
            );
        return UnpaywallAPIFetcher.instance;
    }

    override specificFetch(objective: object): UnpaywallResultDto {
        console.log(objective);
        return {} as object;
    }
}
