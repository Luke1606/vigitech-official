import { Module } from '@nestjs/common';
import { ItemsIdentifyingService } from './items-identifying.service';
import { CentralizedAiAgentModule } from '../../centralized-ai-agent/centralized-ai-agent.module';
import { PrismaService } from '../../../common/services/prisma.service';

@Module({
    imports: [CentralizedAiAgentModule],
    providers: [ItemsIdentifyingService, PrismaService],
    exports: [ItemsIdentifyingService],
})
export class ItemsIdentifyingModule {}
