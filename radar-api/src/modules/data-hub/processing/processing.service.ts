import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { CentralizedAiAgentService } from '../../centralized-ai-agent/centralized-ai-agent.service';
import { VectorizingService } from '../vectorizing/vectorizing.service';
import { PrismaService } from '../../../common/services/prisma.service';
import { RawData, RawDataType } from '@prisma/client';
import { PROCESSORS_TOKEN } from './constants';

// Define an interface for processors
export interface IProcessor {
    process(rawData: RawData): Promise<void>;
}

@Injectable()
export class ProcessingService implements OnModuleInit {
    private readonly logger = new Logger(ProcessingService.name);
    private readonly processors: Map<RawDataType, IProcessor> = new Map(); // Map by RawDataType

    constructor(
        private readonly aiAgentService: CentralizedAiAgentService,
        private readonly vectorizingService: VectorizingService,
        private readonly prisma: PrismaService,
        @Inject(PROCESSORS_TOKEN) private readonly injectedProcessors: IProcessor[],
    ) {}

    onModuleInit() {
        this.injectedProcessors.forEach((processor) =>
            this.registerProcessor(processor.constructor.name as RawDataType, processor),
        );
    }

    private registerProcessor(key: RawDataType, processor: IProcessor) {
        this.processors.set(key, processor);
        this.logger.log(`Processor for key "${key}" registered.`);
    }

    async processRawData(rawDataId: string): Promise<void> {
        this.logger.log(`Processing raw data with ID: ${rawDataId}`);
        const rawData = await (this.prisma as any).tech_survey.rawData.findUnique({
            where: { id: rawDataId },
        });

        if (!rawData) {
            this.logger.error(`RawData with ID ${rawDataId} not found.`);
            throw new Error(`RawData with ID ${rawDataId} not found.`);
        }

        // Determine which processor to use based on rawData.dataType or other criteria
        const processorKey = rawData.dataType; // Example: use RawDataType as key
        const processor = this.processors.get(processorKey);

        if (!processor) {
            this.logger.error(`No processor registered for data type: ${rawData.dataType}`);
            throw new Error(`No processor registered for data type: ${rawData.dataType}`);
        }

        await processor.process(rawData);

        // Mark raw data as processed
        await (this.prisma as any).tech_survey.rawData.update({
            where: { id: rawDataId },
            data: { processedAt: new Date() },
        });

        this.logger.log(`Raw data with ID ${rawDataId} processed successfully.`);
    }
}
