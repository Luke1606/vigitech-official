import { Module } from '@nestjs/common';
import { OrchestrationService } from './orchestration.service';
import { ItemsIdentifyingModule } from '../items-identifying/items-identifying.module';
import { ItemsGatewayModule } from '../gateway/gateway.module';
import { UserPreferencesModule } from '../../user-data/user-preferences/user-preferences.module';
import { OrchestrationController } from './orchestration.controller';

@Module({
    imports: [ItemsIdentifyingModule, ItemsGatewayModule, UserPreferencesModule],
    controllers: [OrchestrationController],
    providers: [OrchestrationService],
})
export class OrchestrationModule {}
