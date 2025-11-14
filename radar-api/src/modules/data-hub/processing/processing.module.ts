import { Module } from '@nestjs/common';
import { ProcessingService, IProcessor } from './processing.service';
import { CentralizedAiAgentModule } from '../../centralized-ai-agent/centralized-ai-agent.module';
import { VectorizingModule } from '../vectorizing/vectorizing.module';
import { PrismaService } from '../../../common/services/prisma.service';
import { TextProcessor } from './processors/text.processor';
import { PROCESSORS_TOKEN } from './constants';

@Module({
    imports: [CentralizedAiAgentModule, VectorizingModule],
    providers: [
        PrismaService,
        TextProcessor, // Provide each processor
        {
            provide: PROCESSORS_TOKEN,
            useFactory: (...processors: IProcessor[]) => processors,
            inject: [TextProcessor], // Inject all processors here
        },
        ProcessingService, // ProcessingService will inject PROCESSORS_TOKEN
    ],
    exports: [ProcessingService],
})
export class ProcessingModule {}
