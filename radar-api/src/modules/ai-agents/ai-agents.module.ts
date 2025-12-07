/**
 * Módulo para la gestión de agentes de inteligencia artificial.
 * Proporciona servicios para la interacción con diferentes modelos de IA
 * como la generación de texto y la creación de embeddings.
 * @module AiAgentsModule
 */
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiAgentsService } from './ai-agents.service';
import { AiAgentsController } from './ai-agents.controller';
import { LLMClient } from './clients/llm-client/llm.client.service';
import { EmbeddingAiClient } from './clients/embedding-client/embedding.client.service';

@Module({
    imports: [HttpModule],
    controllers: [AiAgentsController],
    providers: [AiAgentsService, LLMClient, EmbeddingAiClient],
    exports: [AiAgentsService],
})
export class AiAgentsModule {}
