import { Module } from '@nestjs/common';
import { ProcessingService } from './processing.service';
import { AiAgentsModule } from '../../ai-agents/ai-agents.module';

@Module({
    imports: [AiAgentsModule],
    providers: [ProcessingService],
    exports: [ProcessingService],
})
export class ProcessingModule {}
