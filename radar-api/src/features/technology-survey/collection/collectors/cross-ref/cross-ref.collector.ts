import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseCollector } from '../../base.collector';
import { PrismaService } from '../../../../../common/services/prisma.service';

@Injectable()
export class CrossRefCollector extends BaseCollector {
    readonly quadrant = RadarQuadrant.SCIENTIFIC_STAGE;

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async collect(): Promise<void> {
        this.logger.log(`Collecting data from CrossRef for quadrant ${this.quadrant}...`);

        // CrossRef API para obtener publicaciones científicas (simplificación)
        // La API de CrossRef es bastante rica y permite buscar por varios criterios.
        // Aquí, un ejemplo simple para obtener artículos recientes.
        const crossRefApiUrl = 'https://api.crossref.org/works?rows=10&sort=deposited&order=desc';

        try {
            const response = await this.httpService.get(crossRefApiUrl).toPromise();
            const items = response?.data?.message?.items;

            if (items && items.length > 0) {
                for (const item of items) {
                    await this.saveRawData('CrossRef', 'Publication', item);
                }
                this.logger.log(`Successfully collected ${items.length} publications from CrossRef.`);
            } else {
                this.logger.warn('No publications found from CrossRef API.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data from CrossRef', error);
        }
    }
}
