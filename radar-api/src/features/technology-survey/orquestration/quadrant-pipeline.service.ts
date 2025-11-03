import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BaseFetchingService } from './api-fetchers/fetching-service.base';
import { BaseMCPAgent } from '../analysis/ai-agents/base-ai-agent.client';
import { SurveyItem, RadarQuadrant, UserPreferences, Frequency } from '@prisma/client';
import { CreateSurveyItemType } from '../../../../user-data/survey-items/types/create-survey-item.type';
import { CreateInsightType } from '../types/create-insight.type';
import { IExternalReference } from '../../shared/types/external-references.type';

/**
 * Servicio de orquestación para gestionar el pipeline de procesamiento de ítems por cuadrante.
 * Incluye la obtención de tendencias, consolidación de identidad, fusión de metadata,
 * llamada a agentes AI, fusión de insights y almacenamiento en la base de datos.
 */
@Injectable()
export class QuadrantPipelineService {
    private readonly logger = new Logger(QuadrantPipelineService.name);

    // Mapas para almacenar los servicios de fetching y agentes AI por cuadrante
    private fetchingServices: Map<RadarQuadrant, BaseFetchingService[]> = new Map();
    private aiAgents: Map<RadarQuadrant, BaseMCPAgent[]> = new Map();

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        // Inyectar todos los servicios de fetching y agentes AI aquí
        // Esto se hará a través de un módulo dinámico o un enfoque similar
        // Por ahora, se asume que se inyectarán y se registrarán manualmente
    ) {}

    /**
     * Registra un servicio de fetching para un cuadrante específico.
     * @param quadrant El cuadrante al que pertenece el servicio.
     * @param service La instancia del servicio de fetching.
     */
    registerFetchingService(quadrant: RadarQuadrant, service: BaseFetchingService) {
        if (!this.fetchingServices.has(quadrant)) {
            this.fetchingServices.set(quadrant, []);
        }
        this.fetchingServices.get(quadrant)?.push(service);
        this.logger.log(`Registered fetching service ${service.constructor.name} for quadrant ${quadrant}`);
    }

    /**
     * Registra un agente AI para un cuadrante específico.
     * @param quadrant El cuadrante al que pertenece el agente AI.
     * @param agent La instancia del agente AI.
     */
    registerAIAgent(quadrant: RadarQuadrant, agent: BaseMCPAgent) {
        if (!this.aiAgents.has(quadrant)) {
            this.aiAgents.set(quadrant, []);
        }
        this.aiAgents.get(quadrant)?.push(agent);
        this.logger.log(`Registered AI agent ${agent.constructor.name} for quadrant ${quadrant}`);
    }

    /**
     * Ejecuta el pipeline de recomendaciones para un cuadrante específico.
     * Este proceso busca nuevas tendencias, consolida identidades y genera insights.
     * @param quadrant El cuadrante para el cual ejecutar el pipeline.
     */
    async executeRecommendationPipeline(quadrant: RadarQuadrant): Promise<void> {
        this.logger.log(`Starting recommendation pipeline for quadrant: ${quadrant}`);
        const fetchingServices = this.fetchingServices.get(quadrant) || [];

        // 1. Fetch nuevas tendencias de cada API
        const trendingItemsPromises = fetchingServices.map((service) => service.getTrendings());
        const trendingItemsArrays = await Promise.all(trendingItemsPromises);
        const allTrendingItems: CreateSurveyItemType[] = trendingItemsArrays.flat();

        for (const newItem of allTrendingItems) {
            // 2. Consolidación de Identidad (Intelligent Search para nuevas tendencias)
            let surveyItem = await this.prisma.surveyItem.findFirst({
                where: {
                    title: newItem.title, // Buscar por título como primera aproximación
                    radarQuadrant: quadrant,
                },
            });

            if (!surveyItem) {
                // Si no existe, crear un nuevo SurveyItem con la primera referencia
                surveyItem = await this.prisma.surveyItem.create({
                    data: {
                        title: newItem.title,
                        summary: newItem.summary,
                        radarQuadrant: newItem.radarQuadrant,
                        radarRing: newItem.radarRing || 'UNKNOWN', // Default to UNKNOWN
                        externalReferences: newItem.externalReferences,
                        consolidatedMetadata: {},
                        insights: {},
                    },
                });
                this.logger.log(`Created new SurveyItem: ${surveyItem.title}`);
            } else {
                // Si ya existe, intentar consolidar referencias externas
                const updatedReferences = surveyItem.externalReferences as IExternalReference[];
                for (const newRef of newItem.externalReferences) {
                    if (
                        !updatedReferences.some(
                            (ref) => ref.source === newRef.source && ref.externalId === newRef.externalId,
                        )
                    ) {
                        updatedReferences.push(newRef);
                    }
                }
                surveyItem = await this.prisma.surveyItem.update({
                    where: { id: surveyItem.id },
                    data: { externalReferences: updatedReferences },
                });
                this.logger.log(`Updated external references for existing SurveyItem: ${surveyItem.title}`);
            }

            // Intentar identificar el ítem en otras APIs del mismo cuadrante
            for (const service of fetchingServices) {
                const existingRef = (surveyItem.externalReferences as IExternalReference[]).find(
                    (ref) => ref.source === service.constructor.name.replace('FetchingService', ''),
                );
                if (!existingRef) {
                    const identifiedRef = await service.identifyItem(surveyItem.title, surveyItem.summary);
                    if (identifiedRef) {
                        const updatedReferences = [
                            ...(surveyItem.externalReferences as IExternalReference[]),
                            identifiedRef,
                        ];
                        surveyItem = await this.prisma.surveyItem.update({
                            where: { id: surveyItem.id },
                            data: { externalReferences: updatedReferences },
                        });
                        this.logger.log(`Identified item ${surveyItem.title} in ${identifiedRef.source}`);
                    }
                }
            }

            // 3. Recopilación y Consolidación de Metadata
            const consolidatedMetadata: Record<string, unknown> = {};
            for (const service of fetchingServices) {
                const metadata = await service.getInfoFromItem(surveyItem);
                Object.assign(consolidatedMetadata, { [service.constructor.name]: metadata });
            }

            // Guardar metadata consolidada
            const itemMetadata = await this.prisma.itemMetadata.create({
                data: {
                    mergedData: consolidatedMetadata,
                },
            });

            // 4. Análisis AI y Generación de Insights
            const aiAgents = this.aiAgents.get(quadrant) || [];
            let mergedInsights: CreateInsightType = {
                citations: 0,
                downloads: 0,
                relevance: 0,
                accesibilityLevel: 'UNKNOWN' as any, // Placeholder, will be updated
                trending: 'STABLE' as any, // Placeholder, will be updated
                radarRing: 'UNKNOWN' as any, // Placeholder, will be updated
            };

            for (const agent of aiAgents) {
                const insights = await agent.getInsightsFromMetadata(surveyItem, consolidatedMetadata);
                // Simple merge strategy: last agent's insights overwrite previous ones for now
                // A more sophisticated merge would average or prioritize
                mergedInsights = { ...mergedInsights, ...insights };
            }

            // Guardar insights consolidados
            const quadrantInsights = await this.prisma.quadrantInsights.create({
                data: {
                    citations: mergedInsights.citations,
                    downloads: mergedInsights.downloads,
                    relevance: mergedInsights.relevance,
                    accesibilityLevel: mergedInsights.accesibilityLevel,
                    trending: mergedInsights.trending,
                },
            });

            // Actualizar SurveyItem con insights y radarRing
            await this.prisma.surveyItem.update({
                where: { id: surveyItem.id },
                data: {
                    radarRing: mergedInsights.radarRing,
                    consolidatedMetadata: consolidatedMetadata,
                    insights: mergedInsights, // Store merged insights directly
                },
            });

            // Crear registro de análisis
            await this.prisma.itemAnalysis.create({
                data: {
                    itemId: surveyItem.id,
                    metadataId: itemMetadata.id,
                    insightsId: quadrantInsights.id,
                },
            });

            this.logger.log(`Processed SurveyItem: ${surveyItem.title} with RadarRing: ${mergedInsights.radarRing}`);
        }
        this.logger.log(`Recommendation pipeline for quadrant ${quadrant} completed.`);
    }

    /**
     * Ejecuta el pipeline de análisis para ítems suscritos.
     * Este proceso actualiza la metadata y los insights de ítems existentes.
     * @param quadrant El cuadrante para el cual ejecutar el pipeline.
     */
    async executeAnalysisPipeline(quadrant: RadarQuadrant): Promise<void> {
        this.logger.log(`Starting analysis pipeline for quadrant: ${quadrant}`);
        const fetchingServices = this.fetchingServices.get(quadrant) || [];
        const aiAgents = this.aiAgents.get(quadrant) || [];

        // Obtener todos los ítems suscritos para este cuadrante
        const subscribedItems = await this.prisma.surveyItem.findMany({
            where: {
                radarQuadrant: quadrant,
                subscribedBy: {
                    some: {}, // Items that have at least one subscription
                },
            },
            include: {
                subscribedBy: true, // Include subscriptions to filter by user preferences later if needed
            },
        });

        for (const item of subscribedItems) {
            // 1. Recopilación y Consolidación de Metadata Actualizada
            const consolidatedMetadata: Record<string, unknown> = {};
            for (const service of fetchingServices) {
                const metadata = await service.getInfoFromItem(item);
                Object.assign(consolidatedMetadata, { [service.constructor.name]: metadata });
            }

            // Guardar metadata consolidada
            const itemMetadata = await this.prisma.itemMetadata.create({
                data: {
                    mergedData: consolidatedMetadata,
                },
            });

            // 2. Análisis AI y Generación de Insights Actualizados
            let mergedInsights: CreateInsightType = {
                citations: 0,
                downloads: 0,
                relevance: 0,
                accesibilityLevel: 'UNKNOWN' as any,
                trending: 'STABLE' as any,
                radarRing: 'UNKNOWN' as any,
            };

            for (const agent of aiAgents) {
                const insights = await agent.getInsightsFromMetadata(item, consolidatedMetadata);
                mergedInsights = { ...mergedInsights, ...insights };
            }

            // Guardar insights consolidados
            const quadrantInsights = await this.prisma.quadrantInsights.create({
                data: {
                    citations: mergedInsights.citations,
                    downloads: mergedInsights.downloads,
                    relevance: mergedInsights.relevance,
                    accesibilityLevel: mergedInsights.accesibilityLevel,
                    trending: mergedInsights.trending,
                },
            });

            // Actualizar SurveyItem con insights y radarRing
            await this.prisma.surveyItem.update({
                where: { id: item.id },
                data: {
                    radarRing: mergedInsights.radarRing,
                    consolidatedMetadata: consolidatedMetadata,
                    insights: mergedInsights,
                },
            });

            // Crear registro de análisis
            await this.prisma.itemAnalysis.create({
                data: {
                    itemId: item.id,
                    metadataId: itemMetadata.id,
                    insightsId: quadrantInsights.id,
                },
            });

            this.logger.log(`Re-analyzed SurveyItem: ${item.title} with new RadarRing: ${mergedInsights.radarRing}`);
        }
        this.logger.log(`Analysis pipeline for quadrant ${quadrant} completed.`);
    }
}
