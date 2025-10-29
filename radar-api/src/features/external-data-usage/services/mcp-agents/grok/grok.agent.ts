import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { BaseMCPAgent } from '../base-mcp-agent.client';
import { GeneralSearchResult, SurveyItem } from '@prisma/client';
import { CreateMetricsType } from '../../../types/create-analysis-metrics.type';

@Injectable()
export class GrokAgent extends BaseMCPAgent {
    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService,
    ) {
        const loggerName: string = 'GrokAgent';

        const grokUrl: string = configService.get<string>('GROK_API_URL') || 'https://grok.x.com';

        const apiKey: string = configService.get<string>('GROK_API_Key') || 'apikey';

        if (!grokUrl || !apiKey) {
            throw new Error('Grok API URL is missing!');
        }
        super(httpService, loggerName, grokUrl, apiKey);
    }

    getMetricsFromItemData(_item: SurveyItem, _data: GeneralSearchResult): Promise<CreateMetricsType> {
        throw new Error('Method not implemented.');
    }
}
