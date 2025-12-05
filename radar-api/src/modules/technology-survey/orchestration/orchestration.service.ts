import type { UUID } from 'crypto';
import { CronJob } from 'cron';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { Frequency } from '@prisma/client';
import { SurveyOrchestratorUserPreferences } from '@/shared/types/survey-orquestrator-user-preferences.type'; // Tipo usado en tu proyecto
import { UserPreferencesService } from '../../user-data/user-preferences/user-preferences.service';
import { ItemsGatewayService } from '../items-gateway/items-gateway.service';
import { ItemsIdentifyingService } from '../items-identifying/items-identifying.service';
import { frequencyToCron, findMostAggressiveFrequency } from './utils/cron-frequency-mapper.util';

@Injectable()
export class OrchestrationService {
    private readonly logger = new Logger(OrchestrationService.name);
    // Para rastrear la frecuencia global actual y evitar re-programaciones innecesarias
    private currentGlobalRecommendationFrequency: Frequency = Frequency.DAILY;

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly itemsIdentifyingService: ItemsIdentifyingService,
        private readonly itemsGatewayService: ItemsGatewayService,
        private readonly userPreferencesService: UserPreferencesService,
    ) {
        void this.rebuildCronJobs();
    }

    /**
     * Master Cron: Se ejecuta cada hora para re-programar todas las tareas
     * basadas en las preferencias de usuario más recientes.
     */
    @Cron(CronExpression.EVERY_HOUR, { name: 'rebuild_jobs_orchestrator' })
    async rebuildCronJobs(): Promise<void> {
        this.logger.log('--- MASTER ORCHESTRATOR STARTED: Checking user preferences for dynamic scheduling ---');

        const allUserPreferences: SurveyOrchestratorUserPreferences[] =
            await this.userPreferencesService.findAllPreferences();
        this.logger.log(`Found ${allUserPreferences.length} sets of user preferences.`);

        // Limpiar todas las tareas de reclasificación antiguas antes de re-programar
        this.clearAllUserReclassificationJobs();

        // Tarea 1: Identificación de Recomendaciones (Global)
        this.scheduleGlobalRecommendationJob(allUserPreferences);

        // Tarea 2: Re-clasificación de Suscritos (Por Usuario)
        this.schedulePerUserReclassificationJobs(allUserPreferences);

        this.logger.log('--- MASTER ORCHESTRATOR FINISHED ---');
    }

    private scheduleGlobalRecommendationJob(preferences: SurveyOrchestratorUserPreferences[]): void {
        const jobName = 'global_recommendation_identification';

        const newFastestFrequency = findMostAggressiveFrequency(preferences);

        if (
            newFastestFrequency === this.currentGlobalRecommendationFrequency &&
            this.schedulerRegistry.doesExist('cron', jobName)
        ) {
            this.logger.log(`Global job frequency unchanged (${newFastestFrequency}). Skipping reprogramación.`);
            return;
        }

        this.currentGlobalRecommendationFrequency = newFastestFrequency;
        const cronExpression = frequencyToCron(newFastestFrequency);

        try {
            if (this.schedulerRegistry.doesExist('cron', jobName)) {
                this.schedulerRegistry.deleteCronJob(jobName);
            }

            // 1. Definir el callback
            const jobCallback = async () => {
                this.logger.log(`[JOB: ${jobName}] Running trend identification (${newFastestFrequency})`);
                await this.itemsIdentifyingService.identifyNewItems();
            };

            // 2. Crear la instancia de CronJob
            const cronJobInstance = new CronJob(cronExpression, jobCallback);

            // 3. Programamos la nueva tarea con la firma correcta
            this.schedulerRegistry.addCronJob(jobName, cronJobInstance);

            this.logger.warn(
                `Scheduled GLOBAL RECOMMENDATION job (${jobName}) at: ${cronJobInstance.cronTime.source} (New Frequency: ${newFastestFrequency})`,
            );
        } catch (error) {
            this.logger.error(`Error scheduling global job ${jobName}`, error);
        }
    }

    private clearAllUserReclassificationJobs(): void {
        const crons = this.schedulerRegistry.getCronJobs();
        crons.forEach((value, key) => {
            if (key.startsWith('reclassify_')) {
                this.schedulerRegistry.deleteCronJob(key);
                this.logger.verbose(`Deleted old reclassification job: ${key}`);
            }
        });
    }

    private schedulePerUserReclassificationJobs(preferences: SurveyOrchestratorUserPreferences[]): void {
        preferences.forEach((p) => {
            const userId = p.userId as UUID;
            const jobName = `reclassify_${userId.substring(0, 8)}`;
            const frequency = p.reClasificationFrequency;
            const cronExpression = frequencyToCron(frequency);

            try {
                // 1. Definir el callback
                const jobCallback = () => {
                    this.logger.log(`[JOB: ${jobName}] Running reclassification for User ${userId} (${frequency})`);
                    this.itemsGatewayService.reclassifySubscribedItems(userId);
                };

                // 2. Crear la instancia de CronJob
                const cronJobInstance = new CronJob(cronExpression, jobCallback);

                // 3. Programamos la nueva tarea con la firma correcta
                this.schedulerRegistry.addCronJob(jobName, cronJobInstance);

                this.logger.verbose(
                    `Scheduled RECLASSIFICATION job (${jobName}) at: ${cronJobInstance.cronTime.source}`,
                );
            } catch (error) {
                this.logger.error(`Error scheduling job ${jobName} for user ${userId}`, error);
            }
        });
    }
}
