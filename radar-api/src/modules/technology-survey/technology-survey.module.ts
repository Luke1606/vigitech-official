import { Module } from '@nestjs/common';
import { ItemsGatewayModule } from './items-gateway/items-gateway.module';
import { ItemsIdentifyingModule } from './items-identifying/items-identifying.module';

@Module({
    imports: [ItemsGatewayModule, ItemsIdentifyingModule],
})
export class TechnologySurveyModule {}
