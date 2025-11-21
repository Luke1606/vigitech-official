/**
 * Módulo para la gestión de agentes de inteligencia artificial.
 * Proporciona servicios para la interacción con diferentes modelos de IA
 * como la generación de texto y la creación de embeddings.
 * @module AiAgentsModule
 */
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiAgentsService } from './ai-agents.service';
import { GeminiFlashAiClient } from './clients/multi-purpose-client/gemini-flash.client.service';
import { OpenAiTextEmbeddingAiClient } from './clients/embedding-client/open-ai-text-embedding.client.service';

@Module({
    imports: [HttpModule],
    providers: [AiAgentsService, GeminiFlashAiClient, OpenAiTextEmbeddingAiClient],
    exports: [AiAgentsService],
})
export class AiAgentsModule {}
