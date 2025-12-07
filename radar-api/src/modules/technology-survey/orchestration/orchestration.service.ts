import type { UUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { SurveyOrchestratorUserPreferences } from '@/shared/types/survey-orquestrator-user-preferences.type';
import { UserPreferencesService } from '../../user-data/user-preferences/user-preferences.service';
import { ItemsGatewayService } from '../gateway/gateway.service';
import { ItemsIdentifyingService } from '../items-identifying/items-identifying.service';
import { Item } from '@prisma/client';
import { ClassificationChange } from '../shared/types/classification-change.type';

@Injectable()
export class OrchestrationService {
    private readonly logger = new Logger(OrchestrationService.name);

    constructor(
        private readonly itemsIdentifyingService: ItemsIdentifyingService,
        private readonly itemsGatewayService: ItemsGatewayService,
        private readonly userPreferencesService: UserPreferencesService,
    ) {
        this.logger.log('OrchestrationService initialized for manual operation (Cron disabled).');
    }

    // ----------------------------------------------------
    // 1. TAREA: BUSCAR RECOMENDACIONES NUEVAS (GLOBAL)
    // ----------------------------------------------------

    /**
     * Inicia el proceso global de identificación de nuevas tendencias/items de tecnología.
     * Retorna la lista completa de todas las recomendaciones (nuevas y anteriores).
     * @returns Promesa que resuelve con un array de todos los ítems de la encuesta.
     */
    async runGlobalRecommendationJob(userId: UUID): Promise<Item[]> {
        this.logger.log('--- MANUAL TRIGGER: Starting Global Recommendation Identification (Identify New Items) ---');

        // 1. Identificar y crear nuevos ítems (con su clasificación inicial)
        await this.itemsIdentifyingService.identifyNewItems();

        this.logger.log('--- MANUAL TRIGGER: Global Recommendation Identification Finished. Fetching all items. ---');

        // 2. Devolver la lista completa de ítems (nuevos y anteriores)
        // ASUNCIÓN: ItemsGatewayService debe exponer un método findAllItems
        const allRecommendations = await this.itemsGatewayService.findAllRecommended(userId);

        return allRecommendations;
    }

    // ----------------------------------------------------
    // 2. TAREA: RE-CLASIFICACIÓN DE SUSCRITOS (TODOS LOS USUARIOS)
    // ----------------------------------------------------

    /**
     * Inicia el proceso de re-clasificación para todos los ítems suscritos.
     * Retorna una lista desduplicada de solo los elementos cuya clasificación cambió.
     * @returns Promesa que resuelve con un array de ClassificationChange.
     */
    async runAllReclassifications(): Promise<ClassificationChange[]> {
        this.logger.log('--- MANUAL TRIGGER: Starting All Users Reclassification ---');

        const allUserPreferences: SurveyOrchestratorUserPreferences[] =
            await this.userPreferencesService.findAllPreferences();

        this.logger.log(
            `Found ${allUserPreferences.length} sets of user preferences. Running reclassification per user.`,
        );

        const allChanges: ClassificationChange[] = [];

        // Ejecutar las reclasificaciones de usuario de forma concurrente
        const reclassificationPromises = allUserPreferences.map(async (p) => {
            const userId = p.userId as UUID;
            this.logger.log(`Running reclassification for User ${userId}`);

            const userChanges = await this.itemsGatewayService.reclassifySubscribedItems(userId);
            allChanges.push(...userChanges);
        });

        await Promise.all(reclassificationPromises);
        this.logger.log('--- MANUAL TRIGGER: All Reclassification Processes Finished ---');

        // Lógica para desduplicar y devolver solo los cambios de clasificación
        const uniqueChangesMap = new Map<UUID, ClassificationChange>();
        allChanges.forEach((change) => {
            uniqueChangesMap.set(change.itemId, change);
        });

        const finalChanges = Array.from(uniqueChangesMap.values());
        this.logger.log(`Found ${finalChanges.length} unique items with classification changes.`);

        return finalChanges;
    }
}
