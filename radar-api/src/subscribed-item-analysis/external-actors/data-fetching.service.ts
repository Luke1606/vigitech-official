import { Injectable } from '@nestjs/common';
// import { EventEmitter2 } from '@nestjs/event-emitter';

// import { FollowingItemsService } from 'app/following-items-ms/following-items.service';
// import { ItemAnalysisService } from '../item-analysis.service';
// import {
//     CrossRefAPIFetcher,
//     LensAPIFetcher,
//     OpenAlexAPIFetcher,
//     UnpaywallAPIFetcher
// } from './api-fetchers';

// import { CrossRefResult } from '../../../common/dto/cross-ref-result.dto';
// import { LensResult } from '../../../common/dto/lens-result.dto';
// import { OpenAlexResult } from '../../../common/dto/open-alex-result.dto';
// import { UnpaywallResult } from '../../../common/dto/unpaywall-result.dto';
// import { GeneralSearchResultDto } from '../../../common/dto/general-search-result.dto';
// import { FollowingItem } from 'app/following-items-ms/src/entities/following-item.entity';


@Injectable()
export class DataFetchingService {
    // constructor(
    //     private readonly followingItemsService: FollowingItemsService,
    //     private readonly itemAnalysisService: ItemAnalysisService,
    //     private readonly crossRefFetcher: CrossRefAPIFetcher,
    //     private readonly lensFetcher: LensAPIFetcher,
    //     private readonly openAlexClient: OpenAlexAPIFetcher,
    //     private readonly unpaywallClient: UnpaywallAPIFetcher,
    // ) {}
    
    // public async fetchAndInsertInfo (): Promise<void> {
    //     const items = await this.followingItemsService.findAll();

    //     let crossRefResults: CrossRefResult;
    //     let lensResults: LensResult;
    //     let openAlexResults: OpenAlexResult;
    //     let unpaywallResults: UnpaywallResult;
    //     let generalSearchResults: GeneralSearchResultDto;

    //     items.forEach(async (item: FollowingItem) => {
    //         // fetching info
    //         crossRefResults = await this.crossRefFetcher.specificFetch(item);
    //         lensResults = await this.lensFetcher.specificFetch(item);
    //         openAlexResults = await this.openAlexClient.specificFetch(item);
    //         unpaywallResults = await this.unpaywallClient.specificFetch(item);

    //         generalSearchResults = {
    //             crossRefResults,
    //             lensResults,
    //             openAlexResults,
    //             unpaywallResults,
    //         }

    //         // this.itemAnalysisService.append(item.id, generalResults);
    //         console.log(this.itemAnalysisService.analyzeOne(item));
    //         console.log(generalSearchResults);
    //     })
        
    //     const emitter = new EventEmitter2();
    //     emitter.emit('objectives-fetching-completed')
    // }
}