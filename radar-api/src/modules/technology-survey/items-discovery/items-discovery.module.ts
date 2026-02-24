import { Module } from '@nestjs/common';
import { ItemsDiscoveryService } from './items-discovery.service';
import { DataFetchModule } from '../data-fetch/data-fetch.module';
import { ItemsGatewayModule } from '../gateway/gateway.module';
import { AiAgentsModule } from '../../ai-agents/ai-agents.module';

@Module({
    imports: [DataFetchModule, ItemsGatewayModule, AiAgentsModule],
    providers: [ItemsDiscoveryService],
    exports: [ItemsDiscoveryService],
})
export class ItemsIdentifyingModule {}
