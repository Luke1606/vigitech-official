import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { RadarQuadrant } from '@prisma/client';
import { IFetcher } from './collection.interfaces';

@Injectable()
export class CollectionService implements OnModuleInit {
    private readonly logger = new Logger(CollectionService.name);
    private collectors: Map<RadarQuadrant, IFetcher[]> = new Map();

    constructor(@Inject('COLLECTORS_ARRAY') private readonly allCollectors: IFetcher[]) {}

    onModuleInit() {
        this.allCollectors.forEach((collector) => this.registerCollector(collector));
        this.logger.log('CollectionService initialized. All collectors registered.');
    }

    /**
     * Registra un colector para un cuadrante específico.
     * @param collector La instancia del colector.
     */
    registerCollector(_collector: IFetcher) {
        // Usar ICollector
        //     if (!this.collectors.has(collector.quadrants)) {
        //         this.collectors.set(collector.quadrants, []);
        //     }
        //     this.collectors.get(collector.quadrants)?.push(collector);
        //     this.logger.log(`Registered collector ${collector.constructor.name} for quadrant ${collector.quadrant}`);
    }

    /**
     * Ejecuta todos los colectores registrados para un cuadrante específico.
     * @param quadrant El cuadrante para el cual ejecutar los colectores.
     */
    async collectForQuadrant(quadrant: RadarQuadrant): Promise<void> {
        this.logger.log(`Starting data collection for quadrant: ${quadrant}`);
        const quadrantCollectors = this.collectors.get(quadrant) || [];

        if (quadrantCollectors.length === 0) {
            this.logger.warn(`No collectors registered for quadrant: ${quadrant}`);
            return;
        }

        for (const collector of quadrantCollectors) {
            try {
                await collector.fetch();
                this.logger.log(`Collector ${collector.constructor.name} finished for quadrant ${quadrant}`);
            } catch (error) {
                // Explicitly cast error to any
                this.logger.error(`Collector ${collector.constructor.name} failed for quadrant ${quadrant}`, error);
            }
        }
        this.logger.log(`Data collection for quadrant ${quadrant} completed.`);
    }
}
