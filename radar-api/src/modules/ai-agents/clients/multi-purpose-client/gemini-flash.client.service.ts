import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiFlashAiClient {
    private readonly logger: Logger = new Logger(GeminiFlashAiClient.name);
    private readonly baseURL: string = '';
    private readonly apiKey: string;

    protected constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';

        if (!this.apiKey) throw new Error('Gemini api key not found.');

        this.logger.log('Initialized');
    }

    /**
     * TODO Unimplemented
     * @param _prompt
     * @param _context
     * @returns
     */
    async generateResponse(_prompt: string, _context?: object): Promise<object> {
        this.logger.log('Generating text using Gemini Flash client');
        return Promise.resolve({});
    }
}
