import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BaseAiAgentClient } from '../../interfaces/base-ai-agent.interface';
import OpenAI from 'openai';

@Injectable()
export class OpenAiClient extends BaseAiAgentClient {
    private readonly openai: OpenAI;
    protected readonly logger: Logger = new Logger(OpenAiClient.name);

    constructor(
        protected readonly httpService: HttpService,
        protected readonly configService: ConfigService,
    ) {
        const apiKey = configService.get<string>('OPENAI_API_KEY');
        const baseURL = 'https://api.openai.com/v1'; // Default OpenAI API base URL

        super(httpService, OpenAiClient.name, baseURL, apiKey);

        if (!apiKey) {
            this.logger.error('OPENAI_API_KEY is not set in environment variables.');
            throw new Error('OPENAI_API_KEY is not set.');
        }

        this.openai = new OpenAI({
            apiKey: this.apiKey!,
        });
    }

    async generateText(prompt: string): Promise<string | null> {
        try {
            const chatCompletion = await this.openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'gpt-3.5-turbo', // Or any other suitable model
            });
            return chatCompletion.choices[0].message.content;
        } catch (error: any) {
            this.logger.error(`Error generating text with OpenAI: ${error.message}`);
            throw error;
        }
    }

    async generateEmbeddings(text: string[]): Promise<number[][]> {
        try {
            const response = await this.openai.embeddings.create({
                model: 'text-embedding-ada-002', // Or any other suitable embedding model
                input: text,
            });
            return response.data.map((embedding: { embedding: number[] }) => embedding.embedding);
        } catch (error: any) {
            this.logger.error(`Error generating embeddings with OpenAI: ${error.message}`);
            throw error;
        }
    }

    // You can add more methods as needed, e.g., for structured data extraction
    // async extractStructuredData(text: string, schema: any): Promise<any> {
    //     // Implementation for structured data extraction using OpenAI functions or prompt engineering
    // }
}
