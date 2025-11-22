import { Injectable, Logger } from '@nestjs/common';
import { KnowledgeFragment } from '@prisma/client';
import { DataFetchService } from '../data-fetch/data-fetch.service';
import { AiAgentsService } from '../../ai-agents/ai-agents.service';
import { ItemsGatewayService } from '../items-gateway/items-gateway.service';
import { CreateUnclassifiedItemDto } from '../shared/dto/create-unclassified-item.dto';

@Injectable()
export class ItemsIdentifyingService {
    private readonly logger: Logger = new Logger(ItemsIdentifyingService.name);

    constructor(
        private readonly dataFetchService: DataFetchService,
        private readonly itemsGatewayService: ItemsGatewayService,
        private readonly aiAgentsService: AiAgentsService,
    ) {}

    /**
     * Identifica nuevas tecnologías o tendencias emergentes a partir de los fragmentos de conocimiento.
     * Utiliza RAG Negativo (lista de ítems existentes) y RAG Positivo (fragmentos de conocimiento).
     * @returns Promesa vacía al completar la identificación y la creación de lotes.
     */
    async identifyNewItems(): Promise<void> {
        this.logger.log('Identifying new items from various data sources...');

        const existingTitles: string[] = await this.itemsGatewayService.findAllItemTitles();
        const existingTitlesList = existingTitles.map((title) => `"${title}"`).join(', '); // 2. Obtener contexto RAG (Evidencia Positiva)

        const context: KnowledgeFragment[] = await this.dataFetchService.fetchDataForTrendAnalysis();

        this.logger.log(`Fetched ${context.length} knowledge fragments. Excluding ${existingTitles.length} items.`);

        const contextText = context
            .map((fragment: KnowledgeFragment) => `---FRAGMENT ID: ${fragment.id}\n${fragment.textSnippet}`)
            .join('\n\n');

        const prompt: string = `
            Eres un Analista de Tendencias Tecnológicas experto. Tu tarea es identificar y extraer tecnologías, herramientas, plataformas o conceptos emergentes mencionados en el contexto RAG proporcionado.

            --- REGLAS DE EXTRACCIÓN ---
            1. Solo extrae tecnologías nuevas que puedan ser candidatas para el Radar.
            2. Cada tecnología extraída debe tener un TÍTULO claro y un RESUMEN conciso (máx. 3-4 oraciones) que resuma su valor o tendencia principal.
            3. No incluyas tecnologías muy maduras o bien conocidas (ej., JavaScript, React, PostgreSQL).
            4. Genera un MÍNIMO de 1 y un MÁXIMO de 5 ítems nuevos si la evidencia lo permite.

            --- FILTRO NEGATIVO CRÍTICO (Anti-Duplicidad)
            NO debes proponer NINGUNA tecnología cuyo título coincida EXACTAMENTE con los siguientes ítems que ya existen en el Radar:
            [${existingTitlesList}]

            --- CONTEXTO RAG (EVIDENCIA) ---
            ${contextText}

            --- FORMATO DE SALIDA REQUERIDO (JSON Array) ---
            Responde ÚNICAMENTE con un array JSON que coincida con el tipo CreateUnclassifiedItemDto[].

            type CreateUnclassifiedItemDto = {
                title: string; // Nombre de la tecnología.
                summary: string; // Resumen conciso de la tendencia o tecnología.
            }
        `;

        const newItems = (await this.aiAgentsService.generateResponse(prompt, context)) as CreateUnclassifiedItemDto[];

        if (newItems.length > 0) {
            this.logger.log(`Identified ${newItems.length} potential new items. Creating and classifying them...`);

            await this.itemsGatewayService.createBatch(newItems);

            this.logger.log('New items created and classified successfully.');
        } else {
            this.logger.log('No new items identified.');
        }
    }
}
