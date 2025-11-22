import { Module } from '@nestjs/common';
import { ItemsClassificationService } from './items-classification.service';
import { DataFetchModule } from '../data-fetch/data-fetch.module';
import { AiAgentsModule } from '../../ai-agents/ai-agents.module';

@Module({
    imports: [DataFetchModule, AiAgentsModule],
    providers: [ItemsClassificationService],
    exports: [ItemsClassificationService],
})
export class ItemsClassificationModule {}
