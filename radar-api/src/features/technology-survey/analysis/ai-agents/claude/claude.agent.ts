import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { BaseMCPAgent } from '../base-ai-agent.client';
import { CreateInsightType } from '../../../types/create-insight.type';
import { AccesibilityLevel, SurveyItem, Trending, RadarRing } from '@prisma/client';

@Injectable()
export class ClaudeAgent extends BaseMCPAgent {
    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService,
    ) {
        const loggerName: string = 'ClaudeAgent';

        const claudeUrl: string = configService.get<string>('CLAUDE_API_URL') || 'https://api.anthropic.com';

        const apiKey = configService.get<string>('CLAUDE_API_Key');

        if (!claudeUrl || !apiKey) {
            throw new Error('Claude API URL or API Key is missing!');
        }
        super(httpService, loggerName, claudeUrl, apiKey);
    }

    async getInsightsFromMetadata(item: SurveyItem, metadata: Record<string, unknown>): Promise<CreateInsightType> {
        const instructions = `Eres un Agente de Inteligencia de Vigilancia Tecnológica (Vigitech). Tu tarea es analizar la metadata de un ítem tecnológico y proveer insights.

Instrucción: Basado en la metadata, devuelve un objeto JSON con los siguientes campos: "citations" (number), "downloads" (number), "relevance" (number, 0-1), "accesibilityLevel" (string, "FREE" o "PAID"), "trending" (string, "UP", "DOWN", "STABLE", "UNSTABLE"), y "radarRing" (string, "ADOPT", "TEST", "SUSTAIN", "HOLD").`;

        const itemToAnalyze = `--- METADATA A ANALIZAR ---
Título: ${item.title}
Resumen: ${item.summary}
Metadata: ${JSON.stringify(metadata, null, 2)}`;

        try {
            const response = await this.httpService
                .post(
                    '/v1/messages', // Claude messages endpoint
                    {
                        model: 'claude-3-opus-20240229', // Example model, adjust as needed
                        max_tokens: 150,
                        messages: [{ role: 'user', content: instructions + '\n\n' + itemToAnalyze }], // Combine instructions and item to analyze
                        temperature: 0.7,
                    },
                    {
                        headers: {
                            'x-api-key': this.apiKey,
                            'anthropic-version': '2023-06-01',
                        },
                    },
                )
                .toPromise();

            if (!response || !response.data || !response.data.content || response.data.content.length === 0) {
                throw new Error('Invalid response from Claude API');
            }

            const result = JSON.parse(response.data.content[0].text);

            return {
                citations: result.citations || 0,
                downloads: result.downloads || 0,
                relevance: result.relevance || 0,
                accesibilityLevel: result.accesibilityLevel || AccesibilityLevel.FREE,
                trending: result.trending || Trending.STABLE,
                radarRing: result.radarRing || RadarRing.UNKNOWN,
            };
        } catch (error) {
            this.logger.error('Error fetching insights from Claude:', error);
            throw error;
        }
    }
}
