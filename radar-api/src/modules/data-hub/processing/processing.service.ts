import { Injectable, Logger } from '@nestjs/common';
import { RawData, Prisma } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { AiAgentsService } from '../../ai-agents/ai-agents.service';
import { CreateKnowledgeFragment } from './types/create-knowledge-fragment.type';

/**
 * Servicio para procesar datos crudos en fragmentos de conocimiento.
 * Utiliza agentes de IA para la generación de texto y embeddings, y Prisma para las interacciones con la base de datos.
 */
@Injectable()
export class ProcessingService {
    private readonly logger = new Logger(ProcessingService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiAgentService: AiAgentsService,
    ) {}

    /**
     * Procesa un lote de entradas de datos crudos.
     * Extrae fragmentos de conocimiento y KPIs asociados utilizando un agente de IA, genera embeddings,
     * y los almacena como fragmentos de conocimiento en la base de datos.
     * Marca las entradas de datos crudos como procesadas al finalizar con éxito.
     * @param rawDataBatch Un array de objetos RawData a procesar.
     * @returns Una Promesa que se resuelve cuando el procesamiento se ha completado.
     */
    async processRawData(rawDataBatch: RawData[]): Promise<void> {
        this.logger.log(`Procesando lote de datos crudos de ${rawDataBatch.length} elementos`);

        if (rawDataBatch.length > 0) {
            const prompt: string = `
                Eres un asistente de IA especializado en la extracción de fragmentos de conocimiento y KPIs asociados a partir de datos crudos.
                Tu tarea es analizar un lote de entradas de datos crudos y convertirlos en un array estructurado de fragmentos de conocimiento.
                Cada fragmento de conocimiento debe contener un 'textSnippet' (un texto conciso y limpio listo para la inyección en LLM y para la búsqueda semántica)
                y 'associatedKPIs' (métricas estructuradas en formato JSON que viajan con el vector para la búsqueda híbrida).

                Considera las siguientes reglas:
                - Una única entrada de datos crudos podría generar múltiples fragmentos de conocimiento, o múltiples entradas de datos crudos podrían contribuir a un único fragmento de conocimiento.
                - El 'textSnippet' debe ser un resumen o una pieza clave de información derivada de los datos crudos.
                - Los 'associatedKPIs' deben ser métricas relevantes o puntos de datos estructurados extraídos de los datos crudos. Si no se encuentran KPIs específicos, proporciona un objeto JSON vacío.
                - La salida debe ser un JSON con una propiedad 'fragments' que es un array de objetos, donde cada objeto tiene 'textSnippet' (cadena), 'associatedKPIs' (objeto JSON), y 'sourceRawDataIds' (array de cadenas, correspondientes al id original de cada RawData en la que te basaste).

                Aquí está el lote de datos crudos en formato JSON:
                ${JSON.stringify(rawDataBatch)}

                Por favor, devuelve solo el array JSON de fragmentos de conocimiento.
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

                // Dado que createMany de Prisma no soporta directamente el tipo Unsupported("vector"),
                // utilizaremos una consulta SQL cruda para la inserción masiva.
                const insertPromises = knowledgeFragmentsToCreate.map((kf) =>
                    this.prisma.$executeRaw(
                        Prisma.sql`
                            INSERT INTO "tech_survey"."KnowledgeFragment" ("id", "textSnippet", "embedding", "associatedKPIs", "sourceRawDataId", "createdAt")
                            VALUES (gen_random_uuid(), ${kf.textSnippet}, ${Prisma.join(kf.embedding)}, ${kf.associatedKPIs}::jsonb, ${kf.sourceRawDataIds.join()}, NOW());
                        `,
                    ),
                );
                await Promise.all(insertPromises);

                this.logger.log(`${knowledgeFragmentsToCreate.length} fragmentos de conocimiento creados.`);
            }

            await this.prisma.rawData.updateMany({
                where: {
                    id: {
                        in: rawDataBatch.map((data: RawData) => data.id),
                    },
                },
                data: { processedAt: new Date() },
            });

            this.logger.log(`Lote de datos crudos de ${rawDataBatch.length} elementos procesado con éxito.`);
        }
    }
}
