/**
 * Servicio de orquestación que gestiona la programación y ejecución de tareas
 * de recolección y procesamiento de datos utilizando cron jobs.
 * @class OrchestrationService
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/common/services/prisma.service';
import { CollectionService } from '../collection/collection.service';
import { ProcessingService } from '../processing/processing.service';

@Injectable()
export class OrchestrationService {
    private readonly logger = new Logger(OrchestrationService.name);

    /**
     * @param collectionService Servicio de recolección de datos.
     * @param processingService Servicio de procesamiento de datos.
     * @param prisma Servicio Prisma para interactuar con la base de datos.
     */
    constructor(
        private readonly collectionService: CollectionService,
        private readonly processingService: ProcessingService,
        private readonly prisma: PrismaService,
    ) {}

    /**
     * Manejador de cron job que se ejecuta cada hora para iniciar la recolección de datos.
     */
    @Cron(CronExpression.EVERY_HOUR)
    async handleDataCollectionCron() {
        this.logger.log('Starting scheduled data collection...');

        await this.collectionService.collectAllDataAndSave();

        this.logger.log('Data collection finished.');
    }

    /**
     * Manejador de cron job que se ejecuta cada 30 segundos para iniciar el procesamiento de datos.
     * Busca `RawData` no procesados y los envía al `ProcessingService`.
     */
    @Cron(CronExpression.EVERY_30_SECONDS)
    async handleDataProcessingCron() {
        this.logger.log('Starting scheduled data processing...');

        const unprocessedRawData = await this.prisma.rawData.findMany({
            where: {
                processedAt: null,
            },
        });

        await this.processingService.processRawData(unprocessedRawData);
        this.logger.log('Data processing finished.');
    }
}
