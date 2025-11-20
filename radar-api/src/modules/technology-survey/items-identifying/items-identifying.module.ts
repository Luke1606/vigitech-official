import { Module } from '@nestjs/common';
import { ItemsIdentifyingService } from './items-identifying.service';
import { AiAgentsModule } from '../../ai-agents/ai-agents.module';
import { PrismaService } from '../../../common/services/prisma.service';

@Module({
    imports: [AiAgentsModule],
    providers: [ItemsIdentifyingService, PrismaService],
    exports: [ItemsIdentifyingService],
})
export class ItemsIdentifyingModule {}
