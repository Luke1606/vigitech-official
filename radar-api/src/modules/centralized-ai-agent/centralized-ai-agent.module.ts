import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CentralizedAiAgentService } from './centralized-ai-agent.service';
import { OpenAiClient } from './clients/open-ai/open-ai.client';

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [CentralizedAiAgentService, OpenAiClient],
    exports: [CentralizedAiAgentService],
})
export class CentralizedAiAgentModule {}
