import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { BaseMCPAgent } from '../base-mcp-agent.client';
import { GeneralSearchResult, SurveyItem } from '@prisma/client';
import { CreateMetricsType } from '../../../types/create-analysis-metrics.type';

@Injectable()
export class ClaudeAgent extends BaseMCPAgent {
    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService,
    ) {
        const loggerName: string = 'ClaudeAgent';

        const claudeUrl: string = configService.get<string>('CLAUDE_API_URL') || 'https://claude.com';

        const apiKey: string = configService.get<string>('CLAUDE_API_Key') || 'apikey';

        if (!claudeUrl || !apiKey) {
            throw new Error('Claude API URL is missing!');
        }
        super(httpService, loggerName, claudeUrl, apiKey);
    }

    getMetricsFromItemData(_item: SurveyItem, _data: GeneralSearchResult): Promise<CreateMetricsType> {
        throw new Error('Method not implemented.');
    }
}
