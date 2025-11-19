import { Injectable, Logger } from '@nestjs/common';
import { GeminiFlashAiClient } from './clients/multi-purpose-client/gemini-flash.client.service';
import { OpenAiTextEmbeddingAiClient } from './clients/embedding-client/open-ai-text-embedding.client.service';

@Injectable()
export class AiAgentsService {
    private readonly logger = new Logger(AiAgentsService.name);

    constructor(
        private readonly multiPurposeClient: GeminiFlashAiClient,
        private readonly textEmbeddingClient: OpenAiTextEmbeddingAiClient,
    ) {
        this.logger.log('Initialized');
    }

    async generateText(prompt: string, context?: object): Promise<object> {
        return this.multiPurposeClient.generateResponse(prompt, context);
    }

    async generateEmbeddings(text: string[]): Promise<number[][]> {
        return this.textEmbeddingClient.generateEmbeddings(text);
    }
}
