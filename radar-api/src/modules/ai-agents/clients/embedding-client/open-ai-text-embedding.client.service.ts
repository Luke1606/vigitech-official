import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenAiTextEmbeddingAiClient {
    private readonly logger: Logger = new Logger(OpenAiTextEmbeddingAiClient.name);
    private readonly baseURL: string = '';
    // private readonly apiKey: string;

    protected constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        // this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';

        // if (!this.apiKey) throw new Error('Gemini api key not found.');

        this.logger.log('Initialized');
    }

    /**
     * TODO Unimplemented
     * @param _prompt
     * @param _context
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    async generateEmbeddings(_text: string[]): Promise<number[][]> {
        this.logger.log('Generating embeddings using OpenAI client');
        const mock: number[][] = [];
        return mock;
    }
}
