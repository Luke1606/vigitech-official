import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { BaseMCPAgent } from '../base-mcp-agent.client';
import { MetricsDto } from '../../../dto/analysis-metrics.dto';
import { SurveyItemBasicData } from '../../../types/survey-item-basic-data.type';
import { GeneralSearchResultDto } from '../../../dto/general-search-result.dto';

@Injectable()
export class DeepseekAgent extends BaseMCPAgent {
    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService
    ) {
        const loggerName: string = 'DeepseekAgent';

        const deepseekUrl: string =
            configService.get<string>('DEEPSEEK_API_URL') ||
            'https://deepseek-chat.com';

        const apiKey: string =
            configService.get<string>('DEEPSEEK_API_Key') || 'apikey';

        if (!deepseekUrl || !apiKey) {
            throw new Error('Deepseek API URL is missing!');
        }
        super(httpService, loggerName, deepseekUrl, apiKey);
    }

    getMetricsFromItemData(
        _item: SurveyItemBasicData,
        _data: GeneralSearchResultDto
    ): Promise<MetricsDto> {
        throw new Error('Method not implemented.');
    }
}
