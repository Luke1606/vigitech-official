/**
 * Servicio centralizado para interactuar con los diferentes agentes de IA.
 * Proporciona métodos para la generación de texto y la creación de embeddings.
 * @class AiAgentsService
 */
import { Injectable, Logger } from '@nestjs/common';
import { LLMClient } from './clients/llm-client/llm.client.service';
import { EmbeddingAiClient } from './clients/embedding-client/embedding.client.service';

@Injectable()
export class AiAgentsService {
    private readonly logger = new Logger(AiAgentsService.name);

    constructor(
        private readonly multiPurposeClient: LLMClient,
        private readonly textEmbeddingClient: EmbeddingAiClient,
    ) {
        this.logger.log('Initialized');
    }

    /**
     * Genera una respuesta de texto utilizando el cliente de IA multi-propósito (Gemini Flash).
     * @param prompt La instrucción o pregunta principal para el modelo de lenguaje.
     * @param context (Opcional) Contexto adicional o datos brutos que el modelo debe considerar.
     * @returns Una promesa que resuelve con la respuesta generada por el modelo.
     */
    async generateResponse(prompt: string, context?: object): Promise<object> {
        return this.multiPurposeClient.generateResponse(prompt, context);
    }

    /**
     * Genera embeddings (vectores numéricos) para un array de cadenas de texto
     * utilizando el cliente de embeddings de texto (OpenAI).
     * @param text Un array de cadenas de texto para las cuales se generarán los embeddings.
     * @returns Una promesa que resuelve con un array de embeddings, donde cada embedding es un array de números.
     */
    async generateEmbeddings(text: string[]): Promise<number[][]> {
        return this.textEmbeddingClient.generateEmbeddings(text);
    }
}
