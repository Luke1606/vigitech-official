import { Module } from '@nestjs/common';
import { OrchestrationModule } from './orchestration/orchestration.module';
import { DataGatewayModule } from './data-gateway/data-gateway.module';
import { CollectionModule } from './collection/collection.module';
import { ProcessingModule } from './processing/processing.module';

@Module({
    imports: [DataGatewayModule, CollectionModule, ProcessingModule, OrchestrationModule],
})
export class DataHubModule {}
