import { Injectable, Logger } from '@nestjs/common';
import { KnowledgeFragment } from '@prisma/client';
import { AiAgentsService } from '../../ai-agents/ai-agents.service';
import { DataFetchService } from '../data-fetch/data-fetch.service';
import { CreateUnclassifiedItemDto } from '../shared/dto/create-unclassified-item.dto';
import {
    CreateExistentItemClassification,
    CreateNewItemClassification,
} from '../shared/types/create-item-classification.type';
import { ItemWithClassification } from '../shared/types/classified-item.type';

@Injectable()
export class ItemsClassificationService {
    private readonly logger: Logger = new Logger(ItemsClassificationService.name);

    constructor(
        private readonly dataFetchService: DataFetchService,
        private readonly aiAgentsService: AiAgentsService,
    ) {}

    /**
     * Clasifica un Ítem de tecnología completamente nuevo.
     * 1. Recupera el contexto (fragmentos) histórico relevante para la clasificación inicial.
     * 2. Envía el contexto junto con el prompt de reglas y formato a la IA.
     * @param item El DTO del Ítem sin clasificar.
     * @returns Promesa que resuelve con la clasificación, el campo asignado y el razonamiento.
     */
    async classifyNewItem(item: CreateUnclassifiedItemDto): Promise<CreateNewItemClassification> {
        this.logger.log(`Classifying new item: ${item.title}`);

        const context: KnowledgeFragment[] = await this.dataFetchService.fetchItemDataForClassification(item);

        const contextText = context
            .map((fragment: KnowledgeFragment) => `---FRAGMENT ID: ${fragment.id}\n${fragment.textSnippet}`)
            .join('\n\n');

        const prompt: string = `
            Eres un Analista de Radar de Elementos Tecnológicos especializado. Tu tarea es CLASIFICAR el elemento y ASIGNAR un CAMPO de tecnología basándote estrictamente en la evidencia proporcionada en el contexto RAG.

            --- REGLAS DEL RADAR ---
            ANILLOS (Clasificación): ADOPT, TEST, SUSTAIN, HOLD.
            CAMPOS (Field): BUSSINESS_INTEL, SCIENTIFIC_STAGE, SUPPORT_PLATTFORMS_AND_TECHNOLOGIES, LANGUAGES_AND_FRAMEWORKS.

            --- Elemento A CLASIFICAR ---
            Título: ${item.title}
            
            --- CONTEXTO RAG (EVIDENCIA) ---
            ${contextText}

            --- FORMATO DE SALIDA REQUERIDO (JSON) ---
            Responde ÚNICAMENTE con un objeto JSON que coincida con el tipo CreateNewItemClassification.

            type CreateNewItemClassification = {
                classification: "ADOPT" | "TEST" | "SUSTAIN" | "HOLD";
                itemField: "BUSSINESS_INTEL" | "SCIENTIFIC_STAGE" | "SUPPORT_PLATTFORMS_AND_TECHNOLOGIES" | "LANGUAGES_AND_FRAMEWORKS";
                insightsValues: { 
                    insight: string; // Justificación concisa basada en el contexto.
                    reasoningMetrics: { [key: string]: number | string }; // Métricas o razonamiento estructurado.
                    citedFragmentIds: string[]; // IDs de fragmentos usados como evidencia directa.
                };
                unclassifiedItem: { title: string; summary: string }; // Devuelve el DTO pero con un summary breve e introductorio al elemento.
            }
        `;

        return (await this.aiAgentsService.generateResponse(prompt, context)) as CreateNewItemClassification;
    }

    /**
     * Procesa la clasificación inicial de un lote de Ítems de forma concurrente.
     * (Optimizado usando Promise.all para reducir la latencia del LLM)
     * @param items Array de DTOs de Ítems nuevos.
     * @returns Promesa que resuelve con un array de clasificaciones.
     */
    async classifyNewBatch(items: CreateUnclassifiedItemDto[]): Promise<CreateNewItemClassification[]> {
        this.logger.log(`Classifying batch of ${items.length} new items`);

        const classificationPromises = items.map((item) => this.classifyNewItem(item));

        return Promise.all(classificationPromises);
    }

    /**
     * Realiza una re-clasificación periódica de un Ítem existente.
     * Requiere el Ítem existente y su clasificación actual para contextualizar el prompt.
     * @param item El Item existente con sus datos, incluyendo la clasificación actual.
     * @returns Promesa que resuelve con la nueva clasificación y el razonamiento.
     */
    async classifyExistentItem(item: ItemWithClassification): Promise<CreateExistentItemClassification> {
        this.logger.log(`Classifying existent item: ${item.title}`);

        const context: KnowledgeFragment[] = await this.dataFetchService.fetchItemDataForReclassification(item);

        const contextText = context
            .map((fragment: KnowledgeFragment) => `---FRAGMENT ID: ${fragment.id}\n${fragment.textSnippet}`)
            .join('\n\n');

        const currentClassification = item.latestClassification?.classification;

        const prompt: string = `
            Eres un Analista de Radar de Tecnología. Tu tarea es evaluar si la tecnología especificada debe cambiar de anillo (clasificación) basándote ESTRICTAMENTE en la evidencia proporcionada en el contexto RAG.

            --- REGLAS DEL RADAR ---
            ANILLOS: ADOPT, TEST, SUSTAIN, HOLD.

            --- TECNOLOGÍA Y ESTADO ACTUAL ---
            Título: ${item.title}
            Descripción: ${item.summary}
            Campo Actual: ${item.itemField}
            Anillo Actual: ${currentClassification || 'TEST'}

            --- INSTRUCCIÓN DE RECLASIFICACIÓN ---
            Analiza el contexto RAG para encontrar evidencia que justifique un *cambio de anillo*. Si la evidencia es insuficiente, la clasificación debe permanecer igual. Justifica la decisión.

            --- CONTEXTO RAG (EVIDENCIA) ---
            ${contextText}

            --- FORMATO DE SALIDA REQUERIDO (JSON) ---
            Responde ÚNICAMENTE con un objeto JSON que coincida con el tipo CreateExistentItemClassification.
            
            type CreateExistentItemClassification = {
                classification: "ADOPT" | "TEST" | "SUSTAIN" | "HOLD";
                // Nota: itemField no se incluye ya que es un item existente.
                insightsValues: { 
                    insight: string; 
                    reasoningMetrics: { [key: string]: number | string }; 
                    citedFragmentIds: string[]; 
                };
                item: { id: string }; // Devuelve solo el ID o el objeto Item original para referencia.
            }
        `;

        return (await this.aiAgentsService.generateResponse(prompt, context)) as CreateExistentItemClassification;
    }

    /**
     * Procesa la re-clasificación de un lote de Ítems de forma concurrente.
     * (Optimizado usando Promise.all para reducir la latencia del LLM)
     * @param items Array de Ítems existentes (debe ser el tipo completo con relaciones).
     * @returns Promesa que resuelve con un array de re-clasificaciones.
     */
    async classifyExistentBatch(items: ItemWithClassification[]): Promise<CreateExistentItemClassification[]> {
        this.logger.log(`Classifying batch of ${items.length} existent items`);

        const classificationPromises = items.map((item) => this.classifyExistentItem(item));

        return Promise.all(classificationPromises);
    }
}
