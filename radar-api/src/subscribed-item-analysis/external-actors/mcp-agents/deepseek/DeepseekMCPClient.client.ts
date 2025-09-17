import { AxiosInstance } from 'axios';
import { BaseExternalMCPClient } from '../base-external-mcp-agent.client';

export class DeepseekMCPClient extends BaseExternalMCPClient {
    private static instance: DeepseekMCPClient;

    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey, axiosInstance);
    }

    public static getInstance(
        axiosInstance?: AxiosInstance
    ): DeepseekMCPClient {
        if (!DeepseekMCPClient.instance)
            DeepseekMCPClient.instance = new DeepseekMCPClient(axiosInstance);
        return DeepseekMCPClient.instance;
    }

    override async specificAnalysis(objective: object): Promise<object> {
        return objective as object;
    }
}
