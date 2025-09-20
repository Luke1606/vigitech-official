import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { BaseMCPAgent } from '../base-mcp-agent.client';
import { MetricsDto } from '../../../dto/analysis-metrics.dto';
import { SurveyItemBasicData } from '../../../types/survey-item-basic-data.type';
import { GeneralSearchResultDto } from '../../../dto/general-search-result.dto';

@Injectable()
export class GeminiAgent extends BaseMCPAgent {
    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService
    ) {
        const loggerName: string = 'GeminiAgent';

        const geminiUrl: string =
            configService.get<string>('GEMINI_API_URL') ||
            'https://gemini.google.com';

        const apiKey: string =
            configService.get<string>('GEMINI_API_Key') || 'apikey';

        if (!geminiUrl || !apiKey) {
            throw new Error('Gemini API URL is missing!');
        }
        super(httpService, loggerName, geminiUrl, apiKey);
    }

    getMetricsFromItemData(
        _item: SurveyItemBasicData,
        _data: GeneralSearchResultDto
    ): Promise<MetricsDto> {
        throw new Error('Method not implemented.');
    }
}
