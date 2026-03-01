import { Module } from '@nestjs/common';
import { ItemsGatewayModule } from './gateway/gateway.module';
import { ItemsDiscoveryModule } from './items-discovery/items-discovery.module';
import { ItemsClassificationModule } from './items-classification/items-classification.module';
import { OrchestrationModule } from './orchestration/orchestration.module';

@Module({
    imports: [ItemsGatewayModule, ItemsDiscoveryModule, ItemsClassificationModule, OrchestrationModule],
})
export class TechnologySurveyModule {}
