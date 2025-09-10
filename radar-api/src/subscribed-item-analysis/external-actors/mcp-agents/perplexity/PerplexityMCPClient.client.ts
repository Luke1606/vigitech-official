import { AxiosInstance } from 'axios';
import { BaseExternalMCPClient } from '../base-external-mcp-agent.client'

export class PerplexityMCPClient extends BaseExternalMCPClient {
    private static instance: PerplexityMCPClient;
        
    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = "";
        const apiKey = "";
        super(crossRefURL, apiKey, axiosInstance);
    };

    public static getInstance(
        axiosInstance?: AxiosInstance,
    ): PerplexityMCPClient {
        if (!PerplexityMCPClient.instance) 
            PerplexityMCPClient.instance = new PerplexityMCPClient(axiosInstance);
        return PerplexityMCPClient.instance;
    };

    override async specificAnalysis (objective: object): Promise<object> {
        return objective as object
    };
};