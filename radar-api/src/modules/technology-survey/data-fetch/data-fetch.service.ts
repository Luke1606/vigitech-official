import { Injectable, Logger } from '@nestjs/common';
import { KnowledgeFragment, Frequency } from '@prisma/client';
import { DataGatewayService } from '../../data-hub/gateway/gateway.service';
import { SearchQuery } from './types/search-query.type';
import { CreateUnclassifiedItemDto } from '../shared/dto/create-unclassified-item.dto';
import { ItemWithClassification } from '../shared/types/classified-item.type';

// --- CONFIGURACIÓN DE PARÁMETROS PREDETERMINADOS ---
const K_FOR_CLASSIFICATION = 15;
const K_FOR_RECLASSIFICATION = 30;
const TREND_ANALYSIS_LIMIT = 1000;
const DEFAULT_RENEW_FREQUENCY = Frequency.DAILY;

/**
 * Servicio para la obtención de datos relacionados con el análisis de tecnología.
 * Optimizado para el Retrieval-Augmented Generation (RAG) de un LLM.
 */
@Injectable()
export class DataFetchService {
    private readonly logger = new Logger(DataFetchService.name);

    constructor(private readonly dataGatewayService: DataGatewayService) {}

    // ----------------------------------------------------
    // 1. ANÁLISIS DE TENDENCIAS (BÚSQUEDA HÍBRIDA)
    // ----------------------------------------------------

    /**
     * Obtiene fragmentos de conocimiento recientes para el análisis de tendencias.
     * Combina búsqueda semántica con filtro temporal.
     * @param renewFrequency Frecuencia de actualización de las recomendaciones.
     * @returns Promesa con un array de KnowledgeFragment.
     */
    async fetchDataForTrendAnalysis(renewFrequency: Frequency = DEFAULT_RENEW_FREQUENCY): Promise<KnowledgeFragment[]> {
        this.logger.log(`Performing HYBRID search for trend analysis (Frequency: ${renewFrequency})`);

        const startDate = this.calculateStartDate(renewFrequency);

        const hybridQuery =
            'Análisis de tendencias recientes, tecnologías emergentes, cambios de adopción y madurez de herramientas en el último trimestre.';

        const query: SearchQuery = {
            query: hybridQuery,
            k: 150,
            limit: TREND_ANALYSIS_LIMIT,
            startDate: startDate,
        };

        return await this.dataGatewayService.search(query);
    }

    // ----------------------------------------------------
    // 2. CLASIFICACIÓN INICIAL (BÚSQUEDA SEMÁNTICA PURA)
    // ----------------------------------------------------

    /**
     * Obtiene contexto relevante para la clasificación inicial de un Item.
     * Utiliza BÚSQUEDA SEMÁNTICA PURA para el contexto histórico completo.
     * @param item El DTO del Item a clasificar (title).
     * @returns Promesa con un array de KnowledgeFragment relevante.
     */
    async fetchItemDataForClassification(item: CreateUnclassifiedItemDto): Promise<KnowledgeFragment[]> {
        this.logger.log(`Performing high-precision semantic search for initial item classification: ${item.title}`);

        const semanticQuery = `Clasificación de la tecnología ${item.title}. Cubrir: madurez, casos de uso, riesgos y evolución.`;

        const query: SearchQuery = {
            query: semanticQuery,
            k: K_FOR_CLASSIFICATION,
            limit: K_FOR_CLASSIFICATION,
        };

        return await this.dataGatewayService.search(query);
    }

    // ----------------------------------------------------
    // 3. RE-CLASIFICACIÓN PERIÓDICA (BÚSQUEDA SEMÁNTICA PROFUNDA)
    // ----------------------------------------------------

    /**
     * Obtiene información para re-clasificar un Item, priorizando evidencia de cambio.
     * Requiere que la relación 'latestClassification' esté cargada en el objeto Item.
     * @param item El objeto Item con la clasificación actual cargada.
     * @returns Promesa con un array de KnowledgeFragment relevante.
     */
    async fetchItemDataForReclassification(item: ItemWithClassification): Promise<KnowledgeFragment[]> {
        this.logger.log(`Performing deep semantic search for reclassification: ${item.title}`);

        // El acceso a `classification` es seguro gracias a la interfaz ItemWithLatestClassification.
        const currentClassification = item.latestClassification.classification;

        const semanticQuery = `Movimiento o cambio de clasificación para ${item.title}. Evidencia para justificar un cambio desde el anillo actual: ${currentClassification} en el campo ${item.itemField}. Enfocarse en riesgos emergentes, nueva adopción y cambios de popularidad recientes. Resumen: ${item.summary}.`;

        const query: SearchQuery = {
            query: semanticQuery,
            k: K_FOR_RECLASSIFICATION,
            limit: K_FOR_RECLASSIFICATION,
        };

        return await this.dataGatewayService.search(query);
    }

    /**
     * Convierte el enum Frequency (de UserPreferences) a su equivalente en minutos.
     * @param frequency La frecuencia de actualización.
     * @returns El intervalo en minutos.
     */
    private frequencyToMinutes(frequency: Frequency): number {
        switch (frequency) {
            case Frequency.EVERY_10_MINUTES:
                return 10;
            case Frequency.EVERY_30_MINUTES:
                return 30;
            case Frequency.HOURLY:
                return 60;
            case Frequency.EVERY_6_HOURS:
                return 360;
            case Frequency.DAILY:
                return 1440;
            case Frequency.EVERY_TWO_DAYS:
                return 2880;
            case Frequency.EVERY_FOUR_DAYS:
                return 5760;
            case Frequency.WEEKLY:
                return 10080;
            default:
                return 1440;
        }
    }

    /**
     * Calcula la fecha de inicio (startDate) para la búsqueda temporal basándose en la frecuencia.
     * @param frequency La frecuencia para el cálculo del intervalo.
     * @returns Objeto Date que marca el inicio del periodo de búsqueda.
     */
    private calculateStartDate(frequency: Frequency): Date {
        const intervalMinutes = this.frequencyToMinutes(frequency);
        const startDate = new Date();
        startDate.setMinutes(startDate.getMinutes() - intervalMinutes);
        return startDate;
    }
}
