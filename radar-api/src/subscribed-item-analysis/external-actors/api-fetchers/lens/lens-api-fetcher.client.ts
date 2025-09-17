import { AxiosInstance } from 'axios';
import { BaseExternalAPIClient } from '../base-external-api-fetcher.client';
import { LensResultDto } from '../../../dto/lens-result.dto';

export class LensAPIFetcher extends BaseExternalAPIClient {
    private static instance: LensAPIFetcher;

    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey, axiosInstance);
    }

    public static getInstance(axiosInstance?: AxiosInstance): LensAPIFetcher {
        if (!LensAPIFetcher.instance)
            LensAPIFetcher.instance = new LensAPIFetcher(axiosInstance);
        return LensAPIFetcher.instance;
    }

    override specificFetch(objective: object): LensResultDto {
        console.log(objective);
        return {} as object;
    }
}
