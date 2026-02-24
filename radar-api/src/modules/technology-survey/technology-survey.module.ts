import { Module } from '@nestjs/common';
import { ItemsGatewayModule } from './gateway/gateway.module';
import { ItemsIdentifyingModule } from './items-discovery/items-identifying.module';
import { ItemsClassificationModule } from './items-classification/items-classification.module';
import { OrchestrationModule } from './orchestration/orchestration.module';

@Module({
    imports: [ItemsGatewayModule, ItemsIdentifyingModule, ItemsClassificationModule, OrchestrationModule],
})
export class TechnologySurveyModule {}
