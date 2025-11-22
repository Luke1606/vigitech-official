// orchestration/orchestration.module.ts

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OrchestrationService } from './orchestration.service';
import { ItemsIdentifyingModule } from '../items-identifying/items-identifying.module';
import { ItemsGatewayModule } from '../items-gateway/items-gateway.module';
import { UserPreferencesModule } from '../../user-data/user-preferences/user-preferences.module';

@Module({
    imports: [ScheduleModule.forRoot(), ItemsIdentifyingModule, ItemsGatewayModule, UserPreferencesModule],
    providers: [OrchestrationService],
})
export class OrchestrationModule {}
