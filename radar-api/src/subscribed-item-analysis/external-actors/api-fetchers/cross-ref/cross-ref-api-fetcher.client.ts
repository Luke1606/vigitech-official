import { AxiosInstance } from 'axios';
import { BaseExternalAPIClient } from '../base-external-api-fetcher.client';
import { CrossRefResult } from '../../../dto/cross-ref-result.dto';

export class CrossRefAPIFetcher extends BaseExternalAPIClient {
    private static instance: CrossRefAPIFetcher;

    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = "";
        const apiKey = "";
        super(crossRefURL, apiKey, axiosInstance);
    };

    public static getInstance(
        axiosInstance?: AxiosInstance,
    ): CrossRefAPIFetcher {
        if (!CrossRefAPIFetcher.instance) 
            CrossRefAPIFetcher.instance = new CrossRefAPIFetcher(axiosInstance);
        return CrossRefAPIFetcher.instance;
    };

    override async specificFetch (objective: object): Promise<CrossRefResult> {
        return objective as object
    };    
};