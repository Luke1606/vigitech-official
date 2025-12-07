import type { UUID } from 'crypto';
import { Controller, Post, Res, HttpStatus, Logger, Req } from '@nestjs/common';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/shared/types/authenticated-request.type';
import { Public } from '../../auth/decorators/public.decorator';
import { OrchestrationService } from './orchestration.service';

@Controller('tech-survey/orchestration')
export class OrchestrationController {
    private readonly logger = new Logger(OrchestrationController.name);

    constructor(private readonly orchestrationService: OrchestrationService) {}

    /**
     * Manually triggers the global recommendation process (Task 1).
     * Retorna: La lista completa de todas las recomendaciones (nuevas y anteriores).
     */
    @Post('run-global-recommendations')
    async runGlobalRecommendations(@Req() request: AuthenticatedRequest, @Res() res: Response): Promise<void> {
        this.logger.log('Manual trigger received for global recommendations (Task 1).');

        const userId: UUID = request.userId as UUID;

        try {
            // El servicio ahora devuelve la lista de todos los ítems
            const allRecommendations = await this.orchestrationService.runGlobalRecommendationJob(userId);

            res.status(HttpStatus.OK).json({
                message: `Global recommendation process completed. Found ${allRecommendations.length} total recommendations.`,
                data: allRecommendations, // Devuelve la lista completa de ítems
            });
        } catch (error) {
            this.logger.error('Error triggering global recommendations:', (error as Error).message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to initiate global recommendation process.',
                error: (error as Error).message,
            });
        }
    }

    /**
     * Manually triggers the reclassification process for all subscribed items (Task 2).
     * Retorna: La lista de elementos cuya clasificación ha cambiado.
     */
    @Public()
    @Post('run-all-reclassifications')
    async runAllReclassifications(@Res() res: Response): Promise<void> {
        this.logger.log('Manual trigger received for all reclassifications (Task 2).');

        try {
            // El servicio ahora devuelve la lista de cambios
            const classificationChanges = await this.orchestrationService.runAllReclassifications();

            res.status(HttpStatus.OK).json({
                message: `All reclassification processes completed. Found ${classificationChanges.length} unique items with classification changes.`,
                data: classificationChanges, // Devuelve solo la lista de cambios
            });
        } catch (error) {
            this.logger.error('Error triggering all reclassifications:', (error as Error).message);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Failed to initiate all reclassification processes.',
                error: (error as Error).message,
            });
        }
    }
}
