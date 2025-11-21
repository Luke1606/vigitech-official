/**
 * Cliente de IA para generar embeddings de texto utilizando la API de OpenAI.
 * Gestiona la comunicación con el servicio de embeddings de OpenAI.
 * @class OpenAiTextEmbeddingAiClient
 */
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

    /**
     * @param httpService Servicio HTTP para realizar solicitudes.
     * @param configService Servicio de configuración para acceder a las variables de entorno.
     */
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';

        if (!this.apiKey) throw new Error('OpenAI API key not found.');

        this.embeddingModel = this.configService.get<string>('OPENAI_EMBEDDING_MODEL') || 'text-embedding-ada-002';

        this.logger.log('Initialized');
    }

    /**
     * Genera embeddings para un array de textos utilizando la API de OpenAI.
     * @param text Un array de cadenas de texto para las cuales generar embeddings.
     * @returns Una promesa que resuelve en un array de embeddings (cada embedding es un array de números).
     * @throws {Error} Si ocurre un error durante la generación de embeddings.
     */
    async generateEmbeddings(text: string[]): Promise<number[][]> {
        this.logger.log('Generando embeddings utilizando el cliente de OpenAI');

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
            this.logger.error('Error generando embeddings con el cliente de OpenAI', error);
            throw error;
        }
    }
}
