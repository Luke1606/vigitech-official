import { AxiosInstance } from 'axios';
import { BaseExternalMCPClient } from '../base-external-mcp-agent.client'

export class CodeGPTMCPClient extends BaseExternalMCPClient {
    private static instance: CodeGPTMCPClient;
        
    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = "";
        const apiKey = "";
        super(crossRefURL, apiKey, axiosInstance);
    };

    public static getInstance(
        axiosInstance?: AxiosInstance,
    ): CodeGPTMCPClient {
        if (!CodeGPTMCPClient.instance) 
            CodeGPTMCPClient.instance = new CodeGPTMCPClient(axiosInstance);
        return CodeGPTMCPClient.instance;
    };

    override async specificAnalysis (objective: object): Promise<object> {
        return objective as object
    };
};