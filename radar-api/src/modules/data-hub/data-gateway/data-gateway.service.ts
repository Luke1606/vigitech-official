/**
 * Servicio para el acceso y búsqueda de `KnowledgeFragment`s.
 * Soporta búsquedas por identidad (texto), búsquedas semánticas (embeddings) y búsquedas híbridas.
 * @class DataGatewayService
 */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { AiAgentsService } from '../../ai-agents/ai-agents.service';
import { SearchQueryDto } from './dto/query.dto';
import { KnowledgeFragment, Prisma, RawDataSource, RawDataType } from '@prisma/client';

@Injectable()
export class DataGatewayService {
    private readonly logger = new Logger(DataGatewayService.name);

    /**
     * @param prisma Servicio Prisma para interactuar con la base de datos.
     * @param aiAgentService Servicio de agentes de IA para generar embeddings.
     */
    constructor(
        private readonly prisma: PrismaService,
        private readonly aiAgentService: AiAgentsService,
    ) {
        this.logger.log('Initialized');
    }

    /**
     * Realiza una búsqueda de `KnowledgeFragment`s basada en varios criterios.
     * Puede realizar búsquedas por identidad (texto), semánticas (vectores) o una combinación de ambas.
     * @param queryDto Objeto DTO con los parámetros de búsqueda.
     * @returns Una promesa que resuelve con un array de `KnowledgeFragment`s que coinciden con la consulta.
     */
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
                // Búsqueda Semántica: Utiliza embeddings para encontrar fragmentos relacionados semánticamente.
                this.logger.log(`Performing semantic search for query: "${query}"`);
                const embeddings = await this.aiAgentService.generateEmbeddings([query]);
                const queryEmbedding = embeddings[0];

                // Realiza la búsqueda vectorial utilizando una consulta SQL raw (debido al tipo `Unsupported("vector")` de Prisma)
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
                // Búsqueda por Identidad (basada en texto): Busca fragmentos que contengan el texto de la consulta.
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
            // Sin consulta de texto, solo filtrado y paginación.
            this.logger.log('Performing filtered search without a text query.');
            knowledgeFragments = await this.prisma.knowledgeFragment.findMany({
                where: whereClause,
                take: limit,
                skip: offset,
            });
        }

        return knowledgeFragments;
    }

    /**
     * Construye la cláusula WHERE para la consulta SQL raw, filtrando por fuentes y tipos de datos de `RawData`.
     * @param sources (Opcional) Array de `RawDataSource` para filtrar.
     * @param dataTypes (Opcional) Array de `RawDataType` para filtrar.
     * @returns Un objeto `Prisma.Sql` que representa la cláusula WHERE.
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

        if (conditions.length === 0) {
            return Prisma.empty;
        }

        return Prisma.join(conditions, ' AND ');
    }
}
