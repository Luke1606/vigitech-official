import { Module } from '@nestjs/common';
import { OrchestrationService } from './orchestration.service';
import { ItemsDiscoveryModule } from '../items-discovery/items-discovery.module';
import { ItemsGatewayModule } from '../gateway/gateway.module';
import { UserPreferencesModule } from '../../user-data/user-preferences/user-preferences.module';
import { OrchestrationController } from './orchestration.controller';

@Module({
    imports: [ItemsDiscoveryModule, ItemsGatewayModule, UserPreferencesModule],
    controllers: [OrchestrationController],
    providers: [OrchestrationService],
})
export class OrchestrationModule {}
