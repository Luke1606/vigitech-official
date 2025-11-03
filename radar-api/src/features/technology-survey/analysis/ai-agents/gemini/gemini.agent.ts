import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { BaseMCPAgent } from '../base-ai-agent.client';
import { CreateInsightType } from '../../../types/create-insight.type';
import { AccesibilityLevel, SurveyItem, Trending, RadarRing } from '@prisma/client';

@Injectable()
export class GeminiAgent extends BaseMCPAgent {
    constructor(
        protected readonly httpService: HttpService,
        private configService: ConfigService,
    ) {
        const loggerName: string = 'GeminiAgent';

        const geminiUrl: string =
            configService.get<string>('GEMINI_API_URL') || 'https://generativelanguage.googleapis.com';

        const apiKey = configService.get<string>('GEMINI_API_Key');

        if (!geminiUrl || !apiKey) {
            throw new Error('Gemini API URL or API Key is missing!');
        }
        super(httpService, loggerName, geminiUrl, apiKey);
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
                .post(`/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
                    contents: [{ parts: [{ text: instructions + '\n\n' + itemToAnalyze }] }],
                })
                .toPromise();

            if (!response || !response.data || !response.data.candidates || response.data.candidates.length === 0) {
                throw new Error('Invalid response from Gemini API');
            }

            const result = JSON.parse(response.data.candidates[0].content.parts[0].text);

            return {
                citations: result.citations || 0,
                downloads: result.downloads || 0,
                relevance: result.relevance || 0,
                accesibilityLevel: result.accesibilityLevel || AccesibilityLevel.FREE,
                trending: result.trending || Trending.STABLE,
                radarRing: result.radarRing || RadarRing.UNKNOWN,
            };
        } catch (error: any) {
            this.logger.error('Error fetching insights from Gemini:', error.message);
            throw error;
        }
    }
}
