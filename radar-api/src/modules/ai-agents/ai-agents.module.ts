import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiAgentsService } from './ai-agents.service';

@Module({
    imports: [HttpModule],
    providers: [AiAgentsService],
    exports: [AiAgentsService],
})
export class AiAgentsModule {}
