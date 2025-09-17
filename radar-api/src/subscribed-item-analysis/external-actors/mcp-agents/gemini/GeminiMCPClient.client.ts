import { AxiosInstance } from 'axios';
import { BaseExternalMCPClient } from '../base-external-mcp-agent.client';

export class GeminiMCPClient extends BaseExternalMCPClient {
    private static instance: GeminiMCPClient;

    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey, axiosInstance);
    }

    public static getInstance(axiosInstance?: AxiosInstance): GeminiMCPClient {
        if (!GeminiMCPClient.instance)
            GeminiMCPClient.instance = new GeminiMCPClient(axiosInstance);
        return GeminiMCPClient.instance;
    }

    override async specificAnalysis(objective: object): Promise<object> {
        return objective as object;
    }
}
