// import { UUID } from 'crypto';
import { Injectable } from '@nestjs/common';
// import { EventEmitter2 } from '@nestjs/event-emitter';

// import { FollowingItemsService } from 'app/following-items-ms/following-items.service';
// import { FollowingItemRadarQuadrant, FollowingItemRadarRing } from 'app/following-items-ms/enum/following-items-options';

// import { ItemAnalysisService } from '../item-analysis.service';
// import { GeneralSearchResultDto } from '../dto/general-search-result.dto';
// import { MetricsDto } from '../dto/analysis-metrics.dto';

// import {
//     ChatGPTMCPClient,
//     // ClaudeMCPClient,
//     // CodeGPTMCPClient,
//     // DeepseekMCPClient,
//     // GeminiMCPClient,
//     // GrokMCPClient,
//     // PerplexityMCPClient
// } from './mcp-agents';

@Injectable()
export class DataAnalysisService {
    // constructor(
    //     private readonly itemAnalysisService: ItemAnalysisService,
    //     private readonly followingItemsService: FollowingItemsService,
    //     private readonly chatGPTClient: ChatGPTMCPClient,
    //     // private readonly claudeClient: ClaudeMCPClient,
    //     // private readonly codeGPTClient: CodeGPTMCPClient,
    //     // private readonly deepseekClient: DeepseekMCPClient,
    //     // private readonly geminiClient: GeminiMCPClient,
    //     // private readonly grokClient: GrokMCPClient,
    //     // private readonly perplexityClient: PerplexityMCPClient,
    // ) {}
    // async analizeAndSaveMetrics (): Promise<void> {
    //     const objectives = await this.followingItemsService.findAll();
    //     let latestSearchData: GeneralSearchResultDto | null | undefined;
    //     let analysisMetrics: MetricsDto;
    //     objectives.forEach(async (item: FollowingItem) => {
    //         latestSearchData = await this.itemAnalysisService.findLastFromItem(item)
    //             .then((details: ItemAnalysis | null) => details?.searchedData);
    //         if (!latestSearchData) return;
    //         analysisMetrics = await this.chatGPTClient.specificAnalysis(latestSearchData);
    //         this.updateUbicationFromMetrics(item.id, analysisMetrics);
    //     })
    //     const emitter = new EventEmitter2();
    //     emitter.emit('objectives-analysis-completed');
    // }
    // private updateUbicationFromMetrics (id: UUID, metrics: MetricsDto) {
    //     const quadrant = metrics?
    //         FollowingItemRadarQuadrant.BUSSINESS_INTEL
    //         :
    //         FollowingItemRadarQuadrant.LANGUAGES_AND_FRAMEWORKS;
    //     const ring = metrics?
    //         FollowingItemRadarRing.ADOPT
    //         :
    //         FollowingItemRadarRing.HOLD;
    //     this.followingItemsService.update({
    //         id,
    //         ring,
    //         quadrant
    //     });
    // }
}
