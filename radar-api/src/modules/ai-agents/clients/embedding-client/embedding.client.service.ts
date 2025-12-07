/**
 * Cliente de IA para generar embeddings de texto utilizando la API de Gemini.
 * Gestiona la comunicación con el servicio de embeddings de Gemini.
 * @class EmbeddingAiClient
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmbeddingAiClient {
    private readonly logger: Logger = new Logger(EmbeddingAiClient.name);
    private readonly baseUrl: string;
    private readonly apiKey: string;
    private readonly embeddingModel: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('EMBEDDING_API_KEY') as string;
        this.embeddingModel = this.configService.get<string>('EMBEDDING_MODEL') as string;

        if (!this.apiKey || !this.embeddingModel) throw new Error('Embedding API key or embedding model not found.');

        this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.embeddingModel}:batchEmbedContents`;

        this.logger.log('Initialized');
    }

    /**
     * Genera embeddings para un array de textos utilizando la API de Gemini.
     * @param text Un array de cadenas de texto para las cuales generar embeddings.
     * @returns Una promesa que resuelve en un array de embeddings (cada embedding es un array de números).
     * @throws {Error} Si ocurre un error durante la generación de embeddings.
     */
    async generateEmbeddings(text: string[]): Promise<number[][]> {
        this.logger.log(`Generando ${text.length} embeddings con ${this.embeddingModel}`);

        const requests = text.map((t) => ({
            content: {
                parts: [{ text: t }],
            },
        }));

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.baseUrl}?key=${this.apiKey}`,
                    {
                        requests,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            );

            // Mapear la respuesta para extraer solo los arrays de embedding
            return response.data.embeddings.map((item: any) => item.values);
        } catch (error) {
            this.logger.error('Error generando embeddings', error);
            throw error;
        }
    }
}
