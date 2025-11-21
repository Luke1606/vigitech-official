/**
 * Módulo principal para el Hub de Datos, que integra todos los componentes
 * relacionados con la recolección, procesamiento, orquestación y acceso a datos.
 * @module DataHubModule
 */
import { Module } from '@nestjs/common';
import { OrchestrationModule } from './orchestration/orchestration.module';
import { DataGatewayModule } from './data-gateway/data-gateway.module';
import { CollectionModule } from './collection/collection.module';
import { ProcessingModule } from './processing/processing.module';

@Module({
    imports: [DataGatewayModule, CollectionModule, ProcessingModule, OrchestrationModule],
})
export class DataHubModule {}
