import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';

export abstract class BaseAiAgentClient {
    protected readonly logger: Logger;

    protected constructor(
        protected readonly httpService: HttpService,
        protected readonly loggerName: string,
        protected readonly baseURL: string,
        protected readonly apiKey?: string,
    ) {
        this.logger = new Logger(loggerName);
    }

    // Placeholder for methods that LLM clients will implement
    // abstract generateText(prompt: string): Promise<string>;
    // abstract generateEmbeddings(text: string[]): Promise<number[][]>;
    // abstract extractStructuredData(text: string, schema: any): Promise<any>;
}
