import { Injectable, Logger } from '@nestjs/common';
import { RawData, Prisma } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { AiAgentsService } from '../../ai-agents/ai-agents.service';
import { CreateKnowledgeFragment } from './types/create-knowledge-fragment.type';

@Injectable()
export class ProcessingService {
    private readonly logger = new Logger(ProcessingService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiAgentService: AiAgentsService,
    ) {}

    async processRawData(rawDataBatch: RawData[]): Promise<void> {
        this.logger.log(`Processing raw data batch of ${rawDataBatch.length} items`);

        if (rawDataBatch.length > 0) {
            const prompt: string = `
                You are an AI assistant specialized in extracting knowledge fragments and associated KPIs from raw data.
                Your task is to analyze a batch of raw data entries and convert them into a structured array of knowledge fragments.
                Each knowledge fragment should contain a 'textSnippet' (a concise, clean text ready for LLM injection and for semantic search)
                and 'associatedKPIs' (structured metrics in JSON format that travel with the vector for hybrid search).

                Consider the following rules:
                - A single raw data entry might yield multiple knowledge fragments, or multiple raw data entries might contribute to a single knowledge fragment.
                - The 'textSnippet' should be a summary or a key piece of information derived from the raw data.
                - The 'associatedKPIs' should be relevant metrics or structured data points extracted from the raw data. If no specific KPIs are found, provide an empty JSON object.
                - The output must be a JSON with a 'fragments' property which is an array of objects, where each object has 'textSnippet' (string), 'associatedKPIs' (JSON object), and 'sourceRawDataIds' (array of strings, corresponding to the original id of every RawData you based).

                Here is the raw data batch in JSON format:
                ${JSON.stringify(rawDataBatch)}

                Please return only the JSON array of knowledge fragments.
            `;

            type KnowledgeFragmentWithoutVectorize = Omit<CreateKnowledgeFragment, 'vector'>;

            type KnowledgeAiResponse = {
                fragments: KnowledgeFragmentWithoutVectorize[];
            };

            const aiResponse: KnowledgeAiResponse = (await this.aiAgentService.generateText(
                prompt,
                rawDataBatch,
            )) as KnowledgeAiResponse;

            const knowledgeFragmentsData: KnowledgeFragmentWithoutVectorize[] = aiResponse.fragments || [];

            if (knowledgeFragmentsData.length > 0) {
                const textSnippets: string[] = knowledgeFragmentsData.map((fragment) => fragment.textSnippet);
                const embeddings = await this.aiAgentService.generateEmbeddings(textSnippets);

                const knowledgeFragmentsToCreate: CreateKnowledgeFragment[] = knowledgeFragmentsData.map(
                    (fragment, index) => ({
                        textSnippet: fragment.textSnippet,
                        embedding: embeddings[index],
                        associatedKPIs: fragment.associatedKPIs,
                        sourceRawDataIds: fragment.sourceRawDataIds,
                    }),
                );

                // Since Prisma's createMany does not directly support Unsupported("vector") type,
                // we will use a raw SQL query for bulk insertion.
                const insertPromises = knowledgeFragmentsToCreate.map((kf) =>
                    this.prisma.$executeRaw(
                        Prisma.sql`
                            INSERT INTO "tech_survey"."KnowledgeFragment" ("id", "textSnippet", "embedding", "associatedKPIs", "sourceRawDataId", "createdAt")
                            VALUES (gen_random_uuid(), ${kf.textSnippet}, ${Prisma.join(kf.embedding)}, ${kf.associatedKPIs}::jsonb, ${kf.sourceRawDataIds.join()}, NOW());
                        `,
                    ),
                );
                await Promise.all(insertPromises);

                this.logger.log(`${knowledgeFragmentsToCreate.length} knowledge fragments created.`);
            }

            await this.prisma.rawData.updateMany({
                where: {
                    id: {
                        in: rawDataBatch.map((data: RawData) => data.id),
                    },
                },
                data: { processedAt: new Date() },
            });

            this.logger.log(`Raw data batch of ${rawDataBatch.length} items processed succesfully`);
        }
    }
}
