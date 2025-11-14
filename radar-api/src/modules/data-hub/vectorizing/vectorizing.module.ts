import { Module } from '@nestjs/common';
import { VectorizingService } from './vectorizing.service';
import { CentralizedAiAgentModule } from '../../centralized-ai-agent/centralized-ai-agent.module';
import { PrismaService } from '../../../common/services/prisma.service';

@Module({
    imports: [CentralizedAiAgentModule],
    providers: [VectorizingService, PrismaService],
    exports: [VectorizingService],
})
export class VectorizingModule {}
