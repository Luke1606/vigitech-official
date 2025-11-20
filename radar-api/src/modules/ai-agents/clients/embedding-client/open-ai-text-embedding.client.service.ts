import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OpenAiTextEmbeddingAiClient {
    private readonly logger: Logger = new Logger(OpenAiTextEmbeddingAiClient.name);
    private readonly baseURL: string = 'https://api.openai.com/v1/embeddings';
    private readonly apiKey: string;
    private readonly embeddingModel: string;

    protected constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';

        if (!this.apiKey) throw new Error('OpenAI API key not found.');

        this.embeddingModel = this.configService.get<string>('OPENAI_EMBEDDING_MODEL') || 'text-embedding-ada-002';

        this.logger.log('Initialized');
    }

    async generateEmbeddings(text: string[]): Promise<number[][]> {
        this.logger.log('Generating embeddings using OpenAI client');

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    this.baseURL,
                    {
                        model: this.embeddingModel,
                        input: text,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${this.apiKey}`,
                        },
                    },
                ),
            );
            return response.data.data.map((item: any) => item.embedding);
        } catch (error) {
            this.logger.error('Error generating embeddings with OpenAI client', error);
            throw error;
        }
    }
}
