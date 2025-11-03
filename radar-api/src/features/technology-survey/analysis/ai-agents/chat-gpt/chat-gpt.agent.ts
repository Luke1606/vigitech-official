import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { BaseMCPAgent } from '../base-ai-agent.client';
import { CreateInsightType } from '../../../types/create-insight.type';
import { AccesibilityLevel, SurveyItem, Trending, RadarRing } from '@prisma/client';

@Injectable()
export class ChatGPTAgent extends BaseMCPAgent {
    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService,
    ) {
        const loggerName: string = 'ChatGPTAgent';

        const ChatGptUrl: string = configService.get<string>('CHAT_GPT_API_URL') || 'https://api.openai.com';

        const apiKey = configService.get<string>('CHAT_GPT_API_Key');

        if (!ChatGptUrl || !apiKey) {
            throw new Error('ChatGPT API URL or API Key is missing!');
        }
        super(httpService, loggerName, ChatGptUrl, apiKey);
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
                .post('/v1/chat/completions', {
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 150,
                    response_format: { type: 'json_object' },
                })
                .toPromise();

            if (!response || !response.data || !response.data.choices || response.data.choices.length === 0) {
                throw new Error('Invalid response from ChatGPT API');
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
        } catch (error) {
            this.logger.error('Error fetching insights from ChatGPT:', error);
            throw error;
        }
    }
}
