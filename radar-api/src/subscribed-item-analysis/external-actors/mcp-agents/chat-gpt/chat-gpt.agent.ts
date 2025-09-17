import { AxiosInstance } from 'axios';
import { BaseExternalMCPClient } from '../base-external-mcp-agent.client';
import { GeneralSearchResultDto } from '../../../dto/general-search-result.dto';
import { MetricsDto } from '../../../dto/analysis-metrics.dto';

export class ChatGPTMCPClient extends BaseExternalMCPClient {
    private static instance: ChatGPTMCPClient;

    private constructor(axiosInstance?: AxiosInstance) {
        const crossRefURL = '';
        const apiKey = '';
        super(crossRefURL, apiKey, axiosInstance);
    }

    public static getInstance(axiosInstance?: AxiosInstance): ChatGPTMCPClient {
        if (!ChatGPTMCPClient.instance)
            ChatGPTMCPClient.instance = new ChatGPTMCPClient(axiosInstance);
        return ChatGPTMCPClient.instance;
    }

    override async specificAnalysis(
        data: GeneralSearchResultDto
    ): Promise<MetricsDto> {
        return {} as MetricsDto;
    }
}
