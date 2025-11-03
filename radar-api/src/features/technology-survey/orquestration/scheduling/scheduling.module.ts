import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulingService } from './scheduling.service';
import { PrismaService } from '../../../common/services/prisma.service';
import { QuadrantPipelineService } from '../faltan_por_ubicar/external-actors/services/quadrant-pipeline.service';
import { ConfigService } from '@nestjs/config';

// Import all fetching services and AI agents to be provided to QuadrantPipelineService
import { KaggleFetchingService } from '../faltan_por_ubicar/external-actors/services/api-fetchers/bussiness-intel/kaggle/kaggle.fetching.service';
import { GithubFetcherService } from '../faltan_por_ubicar/external-actors/services/api-fetchers/languages-frameworks/github/github.service';
import { GitlabFetchingService } from '../faltan_por_ubicar/external-actors/services/api-fetchers/languages-frameworks/gitlab/gitlab.fetching.service';
import { CrossRefService } from '../faltan_por_ubicar/external-actors/services/api-fetchers/scientific-stage/cross-ref/cross-ref.service';
import { OpenAlexService } from '../faltan_por_ubicar/external-actors/services/api-fetchers/scientific-stage/open-alex/open-alex.service';
import { DockerHubFetchingService } from '../faltan_por_ubicar/external-actors/services/api-fetchers/support-technologies/docker-hub/docker-hub.fetching.service';
import { KubernetesFetchingService } from '../faltan_por_ubicar/external-actors/services/api-fetchers/support-technologies/kubernetes/kubernetes.fetching.service';

import { ChatGPTAgent } from '../faltan_por_ubicar/external-actors/services/ai-agents/chat-gpt/chat-gpt.agent';
import { ClaudeAgent } from '../faltan_por_ubicar/external-actors/services/ai-agents/claude/claude.agent';
import { CodeGPTAgent } from '../faltan_por_ubicar/external-actors/services/ai-agents/code-gpt/code-gpt.agent';
import { DeepseekAgent } from '../faltan_por_ubicar/external-actors/services/ai-agents/deepseek/deepseek.agent';
import { GeminiAgent } from '../faltan_por_ubicar/external-actors/services/ai-agents/gemini/gemini.agent';
import { GrokAgent } from '../faltan_por_ubicar/external-actors/services/ai-agents/grok/grok.agent';

/**
 * Módulo para la gestión de tareas programadas (cron jobs).
 * Configura el `ScheduleModule` y provee el `SchedulingService`
 * junto con las dependencias necesarias para el pipeline de cuadrantes.
 */
@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [
        SchedulingService,
        PrismaService,
        ConfigService,
        QuadrantPipelineService,
        // Provide all fetching services
        KaggleFetchingService,
        GithubFetcherService,
        GitlabFetchingService,
        CrossRefService,
        OpenAlexService,
        DockerHubFetchingService,
        KubernetesFetchingService,
        // Provide all AI agents
        ChatGPTAgent,
        ClaudeAgent,
        CodeGPTAgent,
        DeepseekAgent,
        GeminiAgent,
        GrokAgent,
    ],
    exports: [SchedulingService],
})
export class SchedulingModule {}
