import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { BaseMCPAgent } from '../base-mcp-agent.client';
import { CreateMetricsType } from '../../../types/create-analysis-metrics.type';
import { GeneralSearchResult, SurveyItem } from '@prisma/client';

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
        _item: SurveyItem,
        _data: GeneralSearchResult
    ): Promise<CreateMetricsType> {
        throw new Error('Method not implemented.');
    }
}
