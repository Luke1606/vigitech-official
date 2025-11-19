// import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { PrismaService } from '../../../../common/services/prisma.service';
// import { QuadrantPipelineService } from '../quadrant-pipeline.service';
// import { RadarQuadrant, Frequency } from '@prisma/client';

// /**
//  * Servicio para la gestión de tareas programadas (cron jobs) personalizadas.
//  * Este servicio orquesta la ejecución periódica de los pipelines de recomendaciones y análisis
//  * basados en las preferencias del usuario.
//  */
// @Injectable()
// export class SchedulingService implements OnModuleInit, OnModuleDestroy {
//     private readonly logger = new Logger(SchedulingService.name);
//     private recommendationIntervals: NodeJS.Timeout[] = [];
//     private analysisIntervals: NodeJS.Timeout[] = [];

//     constructor(
//         private readonly prisma: PrismaService,
//         private readonly quadrantPipelineService: QuadrantPipelineService,
//     ) {}

//     async onModuleInit() {
//         this.logger.log('Initializing scheduling service...');
//         await this.setupScheduling();
//     }

//     onModuleDestroy() {
//         this.logger.log('Destroying scheduling service, clearing intervals...');
//         this.clearAllIntervals();
//     }

//     /**
//      * Configura los intervalos de ejecución para los pipelines de recomendaciones y análisis.
//      * Las frecuencias se obtienen de las preferencias de usuario.
//      */
//     private async setupScheduling() {
//         this.clearAllIntervals(); // Clear any existing intervals before setting up new ones

//         const userPreferences = await this.prisma.userPreferences.findMany(); // Get all user preferences

//         // For simplicity, we'll apply the first user's preferences to all quadrants
//         // In a real-world scenario, scheduling might be per-user or more complex.
//         const defaultPreferences = userPreferences.length > 0 ? userPreferences[0] : null;

//         if (!defaultPreferences) {
//             this.logger.warn('No user preferences found. Scheduling will not be set up.');
//             return;
//         }

//         // Define quadrants to process
//         const quadrants: RadarQuadrant[] = Object.values(RadarQuadrant);

//         // Setup Recommendation Pipeline scheduling
//         const recommendationIntervalMs = this.getIntervalMs(defaultPreferences.recommendationsUpdateFrequency);
//         if (recommendationIntervalMs > 0) {
//             for (const quadrant of quadrants) {
//                 const interval = setInterval(async () => {
//                     await this.quadrantPipelineService.executeRecommendationPipeline(quadrant);
//                 }, recommendationIntervalMs);
//                 this.recommendationIntervals.push(interval);
//                 this.logger.log(`Recommendation pipeline for quadrant ${quadrant} scheduled every ${recommendationIntervalMs / 1000 / 60} minutes.`);
//             }
//         } else {
//             this.logger.warn('Recommendation pipeline not scheduled due to invalid frequency.');
//         }

//         // Setup Analysis Pipeline scheduling
//         const analysisIntervalMs = this.getIntervalMs(defaultPreferences.analysisFrequency);
//         if (analysisIntervalMs > 0) {
//             for (const quadrant of quadrants) {
//                 const interval = setInterval(async () => {
//                     await this.quadrantPipelineService.executeAnalysisPipeline(quadrant);
//                 }, analysisIntervalMs);
//                 this.analysisIntervals.push(interval);
//                 this.logger.log(`Analysis pipeline for quadrant ${quadrant} scheduled every ${analysisIntervalMs / 1000 / 60} minutes.`);
//             }
//         } else {
//             this.logger.warn('Analysis pipeline not scheduled due to invalid frequency.');
//         }
//     }

//     /**
//      * Convierte una frecuencia de `Frequency` a milisegundos.
//      * @param frequency La frecuencia a convertir.
//      * @returns La frecuencia en milisegundos.
//      */
//     private getIntervalMs(frequency: Frequency): number {
//         switch (frequency) {
//             case Frequency.EVERY_10_MINUTES:
//                 return 10 * 60 * 1000;
//             case Frequency.EVERY_30_MINUTES:
//                 return 30 * 60 * 1000;
//             case Frequency.HOURLY:
//                 return 60 * 60 * 1000;
//             case Frequency.EVERY_6_HOURS:
//                 return 6 * 60 * 60 * 1000;
//             case Frequency.DAILY:
//                 return 24 * 60 * 60 * 1000;
//             case Frequency.EVERY_TWO_DAYS:
//                 return 2 * 24 * 60 * 60 * 1000;
//             case Frequency.EVERY_FOUR_DAYS:
//                 return 4 * 24 * 60 * 60 * 1000;
//             case Frequency.WEEKLY:
//                 return 7 * 24 * 60 * 60 * 1000;
//             default:
//                 return 0; // No scheduling
//         }
//     }

//     /**
//      * Limpia todos los intervalos de tiempo programados.
//      */
//     private clearAllIntervals() {
//         this.recommendationIntervals.forEach(clearInterval);
//         this.analysisIntervals.forEach(clearInterval);
//         this.recommendationIntervals = [];
//         this.analysisIntervals = [];
//     }
// }
