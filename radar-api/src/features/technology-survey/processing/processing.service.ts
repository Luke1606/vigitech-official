import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { RadarQuadrant } from '@prisma/client';
import { IProcessor } from './processing.interfaces'; // Importar la interfaz

@Injectable()
export class ProcessingService implements OnModuleInit {
    private readonly logger = new Logger(ProcessingService.name);
    private processors: Map<RadarQuadrant, IProcessor[]> = new Map(); // Usar IProcessor

    constructor(
        private readonly prisma: PrismaService,
        @Inject('PROCESSORS_ARRAY') private readonly allProcessors: IProcessor[], // Inyectar el array
    ) {}

    onModuleInit() {
        this.allProcessors.forEach((processor) => this.registerProcessor(processor));
        this.logger.log('ProcessingService initialized. All processors registered.');
    }

    /**
     * Registra un procesador para un cuadrante específico.
     * @param processor La instancia del procesador.
     */
    registerProcessor(processor: IProcessor) {
        // Usar IProcessor
        if (!this.processors.has(processor.quadrant)) {
            this.processors.set(processor.quadrant, []);
        }
        this.processors.get(processor.quadrant)?.push(processor);
        this.logger.log(`Registered processor ${processor.constructor.name} for quadrant ${processor.quadrant}`);
    }

    /**
     * Procesa los datos brutos para un cuadrante específico.
     * @param quadrant El cuadrante para el cual procesar los datos.
     */
    async processQuadrantRawData(quadrant: RadarQuadrant): Promise<void> {
        this.logger.log(`Starting data processing for quadrant: ${quadrant}`);
        const quadrantProcessors = this.processors.get(quadrant) || [];

        if (quadrantProcessors.length === 0) {
            this.logger.warn(`No processors registered for quadrant: ${quadrant}`);
            return;
        }

        // Obtener datos brutos no procesados para este cuadrante
        const rawDataEntries = await this.prisma.rawData.findMany({
            where: {
                processedAt: null, // Solo procesar los que no han sido procesados
            },
            // Considerar filtrar por dataType si un procesador solo maneja ciertos tipos
        });

        if (rawDataEntries.length === 0) {
            this.logger.log(`No new raw data to process for quadrant: ${quadrant}`);
            return;
        }

        for (const rawData of rawDataEntries) {
            for (const processor of quadrantProcessors) {
                try {
                    await processor.process(rawData);
                    // Marcar el RawData como procesado
                    await this.prisma.rawData.update({
                        where: { id: rawData.id },
                        data: { processedAt: new Date() },
                    });
                    this.logger.log(`Processor ${processor.constructor.name} processed RawData ${rawData.id}.`);
                } catch (error) {
                    this.logger.error(
                        `Processor ${processor.constructor.name} failed for RawData ${rawData.id}:`,
                        error,
                    );
                }
            }
        }
        this.logger.log(`Data processing for quadrant ${quadrant} completed.`);
    }
}
