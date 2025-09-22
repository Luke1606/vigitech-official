import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { BaseMCPAgent } from '../base-mcp-agent.client';
import { CreateMetricsType } from 'src/modules/external-data-usage/types/create-analysis-metrics.type';
import { GeneralSearchResult, SurveyItem } from '@prisma/client';

@Injectable()
export class ChatGPTAgent extends BaseMCPAgent {
    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService
    ) {
        const loggerName: string = 'ChatGPTAgent';

        const ChatGptUrl: string =
            configService.get<string>('CHAT_GPT_API_URL') ||
            'https://chatgpt.openai.com';

        const apiKey: string =
            configService.get<string>('CHAT_GPT_API_Key') || 'apikey';

        if (!ChatGptUrl || !apiKey) {
            throw new Error('ChatGPT API URL is missing!');
        }
        super(httpService, loggerName, ChatGptUrl, apiKey);
    }

    getMetricsFromItemData(
        _item: SurveyItem,
        _data: GeneralSearchResult
    ): Promise<CreateMetricsType> {
        throw new Error('Method not implemented.');
    }
}
