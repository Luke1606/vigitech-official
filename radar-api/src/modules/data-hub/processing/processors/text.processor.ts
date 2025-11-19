import { Injectable, Logger } from '@nestjs/common';
import { RawData, RawDataType } from '@prisma/client';
import { IProcessor } from '../processing.service';
import { CentralizedAiAgentService } from '../../../centralized-ai-agent/centralized-ai-agent.service';
import { VectorizingService } from '../../vectorizing/vectorizing.service';

@Injectable()
export class TextProcessor implements IProcessor {
    private readonly logger = new Logger(TextProcessor.name);

    constructor(
        private readonly aiAgentService: CentralizedAiAgentService,
        private readonly vectorizingService: VectorizingService,
    ) {}

    async process(rawData: RawData): Promise<void> {
        this.logger.log(`Processing text raw data with ID: ${rawData.id}`);

        if (
            rawData.dataType !== RawDataType.ARTICLE &&
            rawData.dataType !== RawDataType.BLOG_POST &&
            rawData.dataType !== RawDataType.RESEARCH_PAPER
        ) {
            this.logger.warn(`TextProcessor received unsupported data type: ${rawData.dataType}. Skipping.`);
            return;
        }

        const content = rawData.content as any; // Assuming content is a JSON object with a 'text' field

        if (!content || typeof content.text !== 'string') {
            this.logger.error(`RawData ${rawData.id} does not contain a valid 'text' field for processing.`);
            throw new Error(`Invalid raw data content for TextProcessor: ${rawData.id}`);
        }

        const text = content.text;

        // 1. Semantic Chunking (using LLM)
        this.logger.log('Performing semantic chunking...');
        const chunkingPrompt = `Divide the following text into meaningful, semantically coherent chunks. Each chunk should be a complete thought or a logical section. Return the chunks as a JSON array of strings.
        Text: ${text}`;
        const chunksJson = await this.aiAgentService.generateText(chunkingPrompt);
        let chunks: string[] = [];
        try {
            chunks = JSON.parse(chunksJson || '[]');
        } catch (e: any) {
            this.logger.error(`Failed to parse chunks from LLM response: ${e.message}`);
            chunks = [text]; // Fallback to single chunk if parsing fails
        }

        // 2. Extract Value (Summary and KPIs using LLM)
        this.logger.log('Extracting summary and KPIs...');
        const extractionPrompt = `Analyze the following text and provide a concise summary (max 3 sentences) and extract key performance indicators (KPIs) or important metrics. Return the output as a JSON object with 'summary' (string) and 'kpis' (object).
        Text: ${text}`;
        const extractionJson = await this.aiAgentService.generateText(extractionPrompt);
        let extractedData: { summary: string; kpis: Record<string, unknown> } = { summary: '', kpis: {} };
        try {
            extractedData = JSON.parse(extractionJson || '{}');
        } catch (e: any) {
            this.logger.error(`Failed to parse extracted data from LLM response: ${e.message}`);
        }

        // 3. Vectorization and Persistence for each chunk
        this.logger.log('Generating embeddings for chunks and storing KnowledgeFragments...');
        for (const chunk of chunks) {
            await this.vectorizingService.generateAndStoreEmbedding(
                chunk,
                rawData.id,
                extractedData.kpis, // Associate KPIs with each fragment
            );
        }

        this.logger.log(`Text raw data with ID: ${rawData.id} processed and vectorized.`);
    }
}
