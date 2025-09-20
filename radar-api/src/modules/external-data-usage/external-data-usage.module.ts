import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import {
    CrossRefService,
    OpenAlexService,
    UnpaywallService,
} from './services/api-fetchers';
import {
    ChatGPTAgent,
    ClaudeAgent,
    CodeGPTAgent,
    DeepseekAgent,
    GeminiAgent,
    GrokAgent,
} from './services/mcp-agents';

@Module({
    imports: [HttpModule],
    providers: [
        CrossRefService,
        OpenAlexService,
        UnpaywallService,

        ChatGPTAgent,
        ClaudeAgent,
        CodeGPTAgent,
        DeepseekAgent,
        GeminiAgent,
        GrokAgent,
    ],
})
export class ExternalActorsModule {}
