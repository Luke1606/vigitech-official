// data-hub/data-gateway/data-gateway.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { KnowledgeFragment, Prisma, RawDataSource, RawDataType } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { AiAgentsService } from '../../ai-agents/ai-agents.service';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class DataGatewayService {
    private readonly logger = new Logger(DataGatewayService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiAgentService: AiAgentsService,
    ) {
        this.logger.log('Initialized');
    }

    /**
     * Construye la cláusula WHERE para la consulta SQL raw, filtrando por fecha de creación de KnowledgeFragment.
     * @param startDate (Opcional) Fecha de inicio.
     * @param endDate (Opcional) Fecha de fin.
     * @returns Un objeto `Prisma.Sql` que representa la cláusula WHERE.
     */
    private buildDateWhereClause(startDate?: Date, endDate?: Date): Prisma.Sql {
        const conditions: Prisma.Sql[] = [];

        if (startDate) {
            conditions.push(Prisma.sql`kf."createdAt" >= ${startDate}`);
        }
        if (endDate) {
            conditions.push(Prisma.sql`kf."createdAt" <= ${endDate}`);
        }

        return conditions.length > 0 ? Prisma.join(conditions, ' AND ') : Prisma.empty;
    }

    /**
     * Construye la cláusula WHERE para la consulta SQL raw, filtrando por fuentes y tipos de datos de `RawData`.
     * (Método original, no modificado)
     */
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

        return conditions.length === 0 ? Prisma.empty : Prisma.join(conditions, ' AND ');
    }

    async search(queryDto: SearchQueryDto): Promise<KnowledgeFragment[]> {
        const { query, sources, dataTypes, startDate, endDate, limit, offset, k } = queryDto;

        let knowledgeFragments: KnowledgeFragment[] = [];

        // Esta cláusula es solo para búsquedas NO vectoriales (findMany)
        const whereClause: Prisma.KnowledgeFragmentWhereInput = {
            AND: [
                sources && sources.length > 0 ? { sourceRawData: { source: { in: sources } } } : {},
                dataTypes && dataTypes.length > 0 ? { sourceRawData: { dataType: { in: dataTypes } } } : {},
                startDate ? { createdAt: { gte: startDate } } : {},
                endDate ? { createdAt: { lte: endDate } } : {},
            ],
        };

        if (query) {
            if (k && k > 0) {
                // Búsqueda Híbrida (Vectorial + Filtros)
                this.logger.log(`Performing hybrid semantic search for query: "${query}"`);
                const embeddings = await this.aiAgentService.generateEmbeddings([query]);
                const queryEmbedding = embeddings[0];

                const rawDataConditions = this.buildRawDataWhereClause(sources, dataTypes);
                const dateConditions = this.buildDateWhereClause(startDate, endDate);

                const whereClauses: Prisma.Sql[] = [];
                if (rawDataConditions !== Prisma.empty) whereClauses.push(rawDataConditions);
                if (dateConditions !== Prisma.empty) whereClauses.push(dateConditions);

                const finalWhereClause =
                    whereClauses.length > 0 ? Prisma.sql`WHERE ${Prisma.join(whereClauses, ' AND ')}` : Prisma.empty;

                const rawResults = await this.prisma.$queryRaw<KnowledgeFragment[]>(
                    Prisma.sql`
                        SELECT
                            kf.id, kf."textSnippet", kf.embedding, kf."associatedKPIs", kf."sourceRawDataId", kf."createdAt"
                        FROM
                            "tech_survey"."KnowledgeFragment" AS kf
                        JOIN
                            "tech_survey"."RawData" AS rd ON kf."sourceRawDataId" = rd.id
                        ${finalWhereClause}
                        ORDER BY
                            kf.embedding <-> ${Prisma.join(queryEmbedding)}::vector
                        LIMIT ${limit} OFFSET ${offset};
                    `,
                );
                knowledgeFragments = rawResults;
            } else {
                // Búsqueda por Identidad (sin K)
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
            this.logger.log('Performing filtered search without a text query.');
            knowledgeFragments = await this.prisma.knowledgeFragment.findMany({
                where: whereClause,
                take: limit,
                skip: offset,
            });
        }

        return knowledgeFragments;
    }
}
