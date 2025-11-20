import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { AiAgentsService } from '../../ai-agents/ai-agents.service';
import { SearchQueryDto } from './dto/query.dto';
import { KnowledgeFragment, Prisma, RawDataSource, RawDataType } from '@prisma/client';

@Injectable()
export class DataGatewayService {
    private readonly logger = new Logger(DataGatewayService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiAgentService: AiAgentsService,
    ) {
        this.logger.log('Initialized');
    }

    async search(queryDto: SearchQueryDto): Promise<KnowledgeFragment[]> {
        const { query, sources, dataTypes, limit, offset, k } = queryDto;

        let knowledgeFragments: KnowledgeFragment[] = [];

        const whereClause: Prisma.KnowledgeFragmentWhereInput = {
            AND: [
                sources && sources.length > 0 ? { sourceRawData: { source: { in: sources } } } : {},
                dataTypes && dataTypes.length > 0 ? { sourceRawData: { dataType: { in: dataTypes } } } : {},
            ],
        };

        if (query) {
            if (k && k > 0) {
                // Semantic Search
                this.logger.log(`Performing semantic search for query: "${query}"`);
                const embeddings = await this.aiAgentService.generateEmbeddings([query]);
                const queryEmbedding = embeddings[0];

                // Perform vector search using raw SQL
                const rawResults = await this.prisma.$queryRaw<KnowledgeFragment[]>(
                    Prisma.sql`
                        SELECT
                            kf.id, kf."textSnippet", kf.embedding, kf."associatedKPIs", kf."sourceRawDataId", kf."createdAt"
                        FROM
                            "tech_survey"."KnowledgeFragment" AS kf
                        JOIN
                            "tech_survey"."RawData" AS rd ON kf."sourceRawDataId" = rd.id
                        WHERE
                            ${this.buildRawDataWhereClause(sources, dataTypes)}
                        ORDER BY
                            kf.embedding <-> ${Prisma.join(queryEmbedding)}::vector
                        LIMIT ${limit} OFFSET ${offset};
                    `,
                );
                knowledgeFragments = rawResults;
            } else {
                // Identity Search (text-based)
                this.logger.log(`Performing identity search for query: "${query}"`);
                knowledgeFragments = await this.prisma.knowledgeFragment.findMany({
                    where: {
                        ...whereClause,
                        textSnippet: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    take: limit,
                    skip: offset,
                });
            }
        } else {
            // No query, just filters and pagination
            this.logger.log('Performing filtered search without a text query.');
            knowledgeFragments = await this.prisma.knowledgeFragment.findMany({
                where: whereClause,
                take: limit,
                skip: offset,
            });
        }

        return knowledgeFragments;
    }

    private buildRawDataWhereClause(sources?: RawDataSource[], dataTypes?: RawDataType[]): Prisma.Sql {
        const conditions: Prisma.Sql[] = [];

        if (sources && sources.length > 0) {
            conditions.push(Prisma.sql`rd.source IN (${Prisma.join(sources.map((s) => Prisma.raw(`'${s}'`)))})`);
        }
        if (dataTypes && dataTypes.length > 0) {
            conditions.push(
                Prisma.sql`rd."dataType" IN (${Prisma.join(dataTypes.map((dt) => Prisma.raw(`'${dt}'`)))})`,
            );
        }

        if (conditions.length === 0) {
            return Prisma.empty;
        }

        return Prisma.join(conditions, ' AND ');
    }
}
