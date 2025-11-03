import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { BaseMCPAgent } from '../base-ai-agent.client';
import { CreateInsightType } from '../../../types/create-insight.type';
import { AccesibilityLevel, SurveyItem, Trending, RadarRing } from '@prisma/client';

@Injectable()
export class CodeGPTAgent extends BaseMCPAgent {
    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService,
    ) {
        const loggerName: string = 'CodeGPTAgent';

        const codeGptUrl: string = configService.get<string>('CODE_GPT_API_URL') || 'https://api.codegpt.co';

        const apiKey = configService.get<string>('CODE_GPT_API_Key');

        if (!codeGptUrl || !apiKey) {
            throw new Error('CodeGPT API URL or API Key is missing!');
        }
        super(httpService, loggerName, codeGptUrl, apiKey);
    }

    async getInsightsFromMetadata(item: SurveyItem, metadata: Record<string, unknown>): Promise<CreateInsightType> {
        const instructions = `Eres un Agente de Inteligencia de Vigilancia Tecnológica (Vigitech). Tu tarea es analizar la metadata de un ítem tecnológico y proveer insights.

Instrucción: Basado en la metadata, devuelve un objeto JSON con los siguientes campos: "citations" (number), "downloads" (number), "relevance" (number, 0-1), "accesibilityLevel" (string, "FREE" o "PAID"), "trending" (string, "UP", "DOWN", "STABLE", "UNSTABLE"), y "radarRing" (string, "ADOPT", "TEST", "SUSTAIN", "HOLD").`;

        const itemToAnalyze = `--- METADATA A ANALIZAR ---
Título: ${item.title}
Resumen: ${item.summary}
Metadata: ${JSON.stringify(metadata, null, 2)}`;

        const messages = [
            { role: 'system', content: instructions },
            { role: 'user', content: itemToAnalyze },
        ];

        try {
            const response = await this.httpService
                .post(
                    '/v1/chat/completions', // Assuming OpenAI-compatible endpoint
                    {
                        model: 'gpt-3.5-turbo', // Placeholder model, adjust as needed for CodeGPT
                        messages: messages,
                        temperature: 0.7,
                        max_tokens: 150,
                        response_format: { type: 'json_object' },
                    },
                )
                .toPromise();

            if (!response || !response.data || !response.data.choices || response.data.choices.length === 0) {
                throw new Error('Invalid response from CodeGPT API');
            }

            const result = JSON.parse(response.data.choices[0].message.content);

            return {
                citations: result.citations || 0,
                downloads: result.downloads || 0,
                relevance: result.relevance || 0,
                accesibilityLevel: result.accesibilityLevel || AccesibilityLevel.FREE,
                trending: result.trending || Trending.STABLE,
                radarRing: result.radarRing || RadarRing.UNKNOWN,
            };
        } catch (error: any) {
            this.logger.error('Error fetching insights from CodeGPT:', error.message);
            throw error;
        }
    }
}
