import { Injectable, Logger } from '@nestjs/common';
import { CentralizedAiAgentService } from '../../centralized-ai-agent/centralized-ai-agent.service';
import { PrismaService } from '../../../common/services/prisma.service';

@Injectable()
export class VectorizingService {
    private readonly logger = new Logger(VectorizingService.name);

    constructor(
        private readonly aiAgentService: CentralizedAiAgentService,
        private readonly prisma: PrismaService,
    ) {}

    async generateAndStoreEmbedding(
        textSnippet: string,
        sourceRawDataId: string,
        associatedKPIs: Record<string, unknown> = {},
    ): Promise<any> {
        try {
            this.logger.log(`Generating embedding for text snippet: ${textSnippet.substring(0, 50)}...`);
            const embeddings = await this.aiAgentService.generateEmbeddings([textSnippet]);
            const embedding = embeddings[0]; // Assuming a single embedding for a single text snippet

            // Store the KnowledgeFragment in the database
            const knowledgeFragment = await (this.prisma as any).tech_survey.knowledgeFragment.create({
                data: {
                    textSnippet,
                    embedding: embedding as any, // Prisma doesn't natively support 'vector' type, so cast to any
                    associatedKPIs,
                    sourceRawDataId,
                },
            });

            this.logger.log(`KnowledgeFragment created with ID: ${knowledgeFragment.id}`);
            return knowledgeFragment;
        } catch (error: any) {
            this.logger.error(`Error generating and storing embedding: ${error.message}`);
            throw error;
        }
    }
}
