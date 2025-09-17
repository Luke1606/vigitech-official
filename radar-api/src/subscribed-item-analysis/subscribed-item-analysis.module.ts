import { Module } from '@nestjs/common';
import { SubscribedItemAnalysisService } from './subscribed-item-analysis.service';
import { SubscribedItemAnalysisController } from './subscribed-item-analysis.controller';

@Module({
    controllers: [SubscribedItemAnalysisController],
    providers: [SubscribedItemAnalysisService],
})
export class SubscribedItemAnalysisModule {}
