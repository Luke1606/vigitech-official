import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { RawData } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeminiFlashAiClient {
    private readonly logger: Logger = new Logger(GeminiFlashAiClient.name);
    private readonly baseURL: string;
    private readonly apiKey: string;

    protected constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';

        if (!this.apiKey) throw new Error('Gemini API key not found.');

        this.baseURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;

        this.logger.log('Initialized');
    }

    async generateResponse(prompt: string, context?: RawData[] | object): Promise<object> {
        this.logger.log('Generating text using Gemini Flash client');

        const content = [
            {
                parts: [{ text: prompt }, { text: `Context: ${JSON.stringify(context)}` }],
            },
        ];

        try {
            const response = await firstValueFrom(this.httpService.post(this.baseURL, { contents: content }));
            return response.data;
        } catch (error) {
            this.logger.error('Error generating text with Gemini Flash client', error);
            throw error;
        }
    }
}
