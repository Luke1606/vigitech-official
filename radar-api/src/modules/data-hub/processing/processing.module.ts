/**
 * Módulo para el procesamiento de `RawData` en `KnowledgeFragment`s.
 * Integra `AiAgentsModule` para la transformación de datos
 * y proporciona el servicio `ProcessingService` para gestionar esta lógica.
 * @module ProcessingModule
 */
import { Module } from '@nestjs/common';
import { ProcessingService } from './processing.service';
import { AiAgentsModule } from '../../ai-agents/ai-agents.module';

@Module({
    imports: [AiAgentsModule],
    providers: [ProcessingService],
    exports: [ProcessingService],
})
export class ProcessingModule {}
