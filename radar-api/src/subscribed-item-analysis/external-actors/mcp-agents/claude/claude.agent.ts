import { AxiosInstance } from 'axios';
import { BaseExternalMCPClient } from '../base-external-mcp-agent.client';

export class ClaudeMCPClient extends BaseExternalMCPClient {
    private static instance: ClaudeMCPClient;

    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey, axiosInstance);
    }

    public static getInstance(axiosInstance?: AxiosInstance): ClaudeMCPClient {
        if (!ClaudeMCPClient.instance)
            ClaudeMCPClient.instance = new ClaudeMCPClient(axiosInstance);
        return ClaudeMCPClient.instance;
    }

    override async specificAnalysis(objective: object): Promise<object> {
        return objective as object;
    }
}
