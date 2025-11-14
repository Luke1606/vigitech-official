import { Injectable, Logger } from '@nestjs/common';
import { OpenAiClient } from './clients/open-ai/open-ai.client';

@Injectable()
export class CentralizedAiAgentService {
    private readonly logger = new Logger(CentralizedAiAgentService.name);

    constructor(private readonly openAiClient: OpenAiClient) {}

    async generateText(prompt: string): Promise<string | null> {
        this.logger.log('Generating text using OpenAI client');
        return this.openAiClient.generateText(prompt);
    }

    async generateEmbeddings(text: string[]): Promise<number[][]> {
        this.logger.log('Generating embeddings using OpenAI client');
        return this.openAiClient.generateEmbeddings(text);
    }

    // Add methods for other LLM clients as they are implemented
}
