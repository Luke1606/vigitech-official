import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { BaseMCPAgent } from '../base-mcp-agent.client';
import { GeneralSearchResult, SurveyItem } from '@prisma/client';
import { CreateMetricsType } from '../../../types/create-analysis-metrics.type';

@Injectable()
export class CodeGPTAgent extends BaseMCPAgent {
    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService
    ) {
        const loggerName: string = 'CodeGPTAgent';

        const codeGptUrl: string =
            configService.get<string>('CODE_GPT_API_URL') ||
            'https://codegpt.com';

        const apiKey: string =
            configService.get<string>('CODE_GPT_API_Key') || 'apikey';

        if (!codeGptUrl || !apiKey) {
            throw new Error('CodeGPT API URL is missing!');
        }
        super(httpService, loggerName, codeGptUrl, apiKey);
    }

    getMetricsFromItemData(
        _item: SurveyItem,
        _data: GeneralSearchResult
    ): Promise<CreateMetricsType> {
        throw new Error('Method not implemented.');
    }
}
