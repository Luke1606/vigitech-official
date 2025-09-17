import { AxiosInstance } from 'axios';
import { BaseExternalMCPClient } from '../base-external-mcp-agent.client';

export class GrokMCPClient extends BaseExternalMCPClient {
    private static instance: GrokMCPClient;

    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey, axiosInstance);
    }

    public static getInstance(axiosInstance?: AxiosInstance): GrokMCPClient {
        if (!GrokMCPClient.instance)
            GrokMCPClient.instance = new GrokMCPClient(axiosInstance);
        return GrokMCPClient.instance;
    }

    override async specificAnalysis(objective: object): Promise<object> {
        return objective as object;
    }
}
