import { Module } from '@nestjs/common';
import { DataGatewayModule } from './data-gateway/data-gateway.module';
import { VectorizingModule } from './vectorizing/vectorizing.module';
import { CollectionModule } from './collection/collection.module';
import { ProcessingModule } from './processing/processing.module';
import { OrchestrationModule } from './orchestration/orchestration.module';

@Module({
    imports: [DataGatewayModule, VectorizingModule, CollectionModule, ProcessingModule, OrchestrationModule],
})
export class DataHubModule {}
