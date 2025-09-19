import { AxiosInstance } from 'axios';
import { BaseExternalMCPClient } from '../base-external-mcp-agent.client';
import { MetricsDto } from 'src/survey-items/dto/analysis-metrics.dto';
import { GeneralSearchResultDto } from 'src/survey-items/dto/general-search-result.dto';
import { SurveyItemBasicData } from 'src/survey-items/types/survey-item-basic-data.type';

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

    // eslint-disable-next-line @typescript-eslint/require-await
    override async specificAnalysis(
        _item: SurveyItemBasicData,
        _data: GeneralSearchResultDto
    ): Promise<MetricsDto> {
        return {} as MetricsDto;
    }
}
