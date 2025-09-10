import { AxiosInstance } from 'axios';
import { BaseExternalAPIClient } from '../base-external-api-fetcher.client'
import { LensResult } from '../../../dto/lens-result.dto';

export class LensAPIFetcher extends BaseExternalAPIClient {
    private static instance: LensAPIFetcher;
    
    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = "";
        const apiKey = "";
        super(crossRefURL, apiKey, axiosInstance);
    };

    public static getInstance(
        axiosInstance?: AxiosInstance,
    ): LensAPIFetcher {
        if (!LensAPIFetcher.instance) 
            LensAPIFetcher.instance = new LensAPIFetcher(axiosInstance);
        return LensAPIFetcher.instance;
    };

    override async specificFetch (objective: object): Promise<LensResult> {
        return objective as object
    };    
};