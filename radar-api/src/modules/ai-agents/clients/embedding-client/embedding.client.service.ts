/**
 * Cliente de IA para generar embeddings de texto utilizando la API de Gemini.
 * Gestiona la comunicación con el servicio de embeddings de Gemini.
 * @class EmbeddingAiClient
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { GoogleGenerativeAI, Content, Part, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class EmbeddingAiClient {
    private readonly logger: Logger = new Logger(EmbeddingAiClient.name);
    private readonly embeddingModel: GenerativeModel;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        const apiKey: string = this.configService.get<string>('EMBEDDING_API_KEY') as string;
        const model: string = this.configService.get<string>('EMBEDDING_MODEL') as string;

        if (!apiKey || !model) throw new Error('Embedding API key or embedding model not found.');

        this.embeddingModel = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model });

        this.logger.log('Initialized');
    }

    /**
     * Genera embeddings para un array de textos utilizando la API de Gemini.
     * @param text Un array de cadenas de texto para las cuales generar embeddings.
     * @returns Una promesa que resuelve en un array de embeddings (cada embedding es un array de números).
     * @throws {Error} Si ocurre un error durante la generación de embeddings.
     */
    async generateEmbeddings(text: string[]): Promise<number[][]> {
        this.logger.log(`Generando ${text.length} embeddings.`);

        const requestsWithContent: { content: Content }[] = text.map((textElement) => {
            const part: Part = { text: textElement };

            const content: Content = {
                role: 'user',
                parts: [part],
            };

            return { content };
        });

        try {
            const result = await this.embeddingModel.batchEmbedContents({
                requests: requestsWithContent,
            });

            return result.embeddings.map((e: { values: number[] }) => e.values);
        } catch (error) {
            this.logger.error('ERROR al generar embeddings con el SDK de Gemini.', error);
            throw new Error('Falló la generación de embeddings. Revisa tu clave y modelo.');
        }
    }
}
