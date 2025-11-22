import { Module } from '@nestjs/common';
import { ItemsIdentifyingService } from './items-identifying.service';
import { DataFetchModule } from '../data-fetch/data-fetch.module';
import { ItemsGatewayModule } from '../items-gateway/items-gateway.module';
import { AiAgentsModule } from '../../ai-agents/ai-agents.module';

@Module({
    imports: [DataFetchModule, ItemsGatewayModule, AiAgentsModule],
    providers: [ItemsIdentifyingService],
    exports: [ItemsIdentifyingService],
})
export class ItemsIdentifyingModule {}
