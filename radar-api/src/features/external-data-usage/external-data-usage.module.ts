import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CrossRefService, OpenAlexService } from './services/api-fetchers';
import { ChatGPTAgent, ClaudeAgent, CodeGPTAgent, DeepseekAgent, GeminiAgent, GrokAgent } from './services/mcp-agents';
import { ExternalDataUsageService } from './external-data-usage.service';

@Module({
    imports: [HttpModule],
    providers: [
        CrossRefService,
        OpenAlexService,

        ChatGPTAgent,
        ClaudeAgent,
        CodeGPTAgent,
        DeepseekAgent,
        GeminiAgent,
        GrokAgent,
        ExternalDataUsageService,
    ],
    exports: [ExternalDataUsageService],
})
export class ExternalDataUsageModule {}
