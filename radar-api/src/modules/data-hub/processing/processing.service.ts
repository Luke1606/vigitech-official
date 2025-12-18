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

    private async updateRawDataProcessedAt(rawDataBatch: RawData[]): Promise<void> {
        await this.prisma.rawData.updateMany({
            where: {
                id: {
                    in: rawDataBatch.map((data: RawData) => data.id),
                },
            },
            data: { processedAt: new Date() },
        });
    }

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
            const rawDataSummaries = rawDataBatch.map((data) => ({
                id: data.id,
                source: data.source,
                dataType: data.dataType,
                contentSnippet: JSON.stringify(data.content).substring(0, 500), // Limitar el tamaño para el prompt
            }));

            const prompt: string = `
                Eres un asistente de IA especializado en la extracción de fragmentos de conocimiento y KPIs asociados a partir de datos crudos.
                Tu tarea es analizar el siguiente lote de entradas de datos crudos y convertirlos en un array estructurado de fragmentos de conocimiento.
                Cada fragmento de conocimiento debe contener un 'textSnippet' (un texto conciso y limpio listo para la inyección en LLM y para la búsqueda semántica)
                y 'associatedKPIs' (métricas estructuradas en formato JSON que viajan con el vector para la búsqueda híbrida).

                Considera las siguientes reglas:
                - Una única entrada de datos crudos podría generar múltiples fragmentos de conocimiento.
                - El 'textSnippet' debe ser un resumen o una pieza clave de información derivada de los datos crudos.
                - Los 'associatedKPIs' deben ser métricas relevantes o puntos de datos estructurados extraídos de los datos crudos. Si no se encuentran KPIs específicos, proporciona un objeto JSON vacío.
                - La salida debe ser un JSON con una propiedad 'fragments' que es un array de objetos, donde cada objeto tiene 'textSnippet' (cadena), 'associatedKPIs' (objeto JSON), y 'sourceRawDataId' (cadena, correspondiente al id original de la RawData en la que te basaste).

                Aquí están los resúmenes de las entradas de datos crudos en formato JSON:
                ${JSON.stringify(rawDataSummaries)}

                Por favor, devuelve solo el array JSON de fragmentos de conocimiento en una propiedad 'fragments'.
            `;

            type KnowledgeFragmentWithoutEmbedding = Omit<CreateKnowledgeFragment, 'embedding'>;

            type KnowledgeAiResponse = {
                fragments: KnowledgeFragmentWithoutEmbedding[];
            };

            let aiResponse: KnowledgeAiResponse;
            try {
                aiResponse = (await this.aiAgentService.generateResponse(
                    prompt,
                    rawDataSummaries,
                )) as KnowledgeAiResponse;
            } catch (error) {
                this.logger.error('Error generando texto con Gemini Flash client', error);
                await this.updateRawDataProcessedAt(rawDataBatch);
                return;
            }

            const knowledgeFragmentsData: KnowledgeFragmentWithoutEmbedding[] = aiResponse.fragments || [];

            if (knowledgeFragmentsData.length > 0) {
                let embeddings: number[][];
                try {
                    const textSnippets: string[] = knowledgeFragmentsData.map((fragment) => fragment.textSnippet);
                    embeddings = await this.aiAgentService.generateEmbeddings(textSnippets);
                } catch (error) {
                    this.logger.error('Error generando embeddings con el cliente de OpenAI', error);
                    await this.updateRawDataProcessedAt(rawDataBatch);
                    return;
                }

                const knowledgeFragmentsToCreate: CreateKnowledgeFragment[] = knowledgeFragmentsData.map(
                    (fragment, index) => ({
                        textSnippet: fragment.textSnippet,
                        embedding: embeddings[index],
                        associatedKPIs: fragment.associatedKPIs,
                        sourceRawDataId: fragment.sourceRawDataId,
                    }),
                );

                const values = knowledgeFragmentsToCreate.map((fragment) => {
                    const vectorValues = fragment.embedding.join(', ');

                    const vectorExpression = Prisma.raw(`'[${vectorValues}]'::vector`);

                    return Prisma.sql`(gen_random_uuid(), ${fragment.textSnippet}, ${vectorExpression}, ${fragment.associatedKPIs}::jsonb, ${fragment.sourceRawDataId})`;
                });

                try {
                    await this.prisma.$executeRaw(
                        Prisma.sql`
                            INSERT INTO "KnowledgeFragment" ("id", "textSnippet", "embedding", "associatedKPIs", "sourceRawDataId")
                            VALUES ${Prisma.join(values, ', ')};
                        `,
                    );
                    this.logger.log(`${knowledgeFragmentsToCreate.length} fragmentos de conocimiento creados.`);
                } catch (error) {
                    this.logger.error('Error during bulk insertion to database', error);
                    await this.updateRawDataProcessedAt(rawDataBatch);
                    return;
                }
            } else {
                this.logger.log('AI response contained no knowledge fragments to create.');
            }
        } else {
            this.logger.log('The provided raw data batch is empty. No processing needed.');
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
