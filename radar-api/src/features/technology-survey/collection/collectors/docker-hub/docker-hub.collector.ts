import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseCollector } from '../../base.collector';
import { PrismaService } from '../../../../../common/services/prisma.service';

@Injectable()
export class DockerHubCollector extends BaseCollector {
    readonly quadrant = RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES;

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async collect(): Promise<void> {
        this.logger.log(`Collecting data from Docker Hub for quadrant ${this.quadrant}...`);

        // Docker Hub API para obtener imágenes populares o en tendencia (simplificación)
        // La API de Docker Hub es pública pero tiene límites de tasa y requiere autenticación para más detalles.
        const dockerHubApiUrl = 'https://hub.docker.com/v2/repositories/library/?page_size=10&ordering=pull_count';

        try {
            const response = await this.httpService.get(dockerHubApiUrl).toPromise();
            const results = response?.data?.results;

            if (results && results.length > 0) {
                for (const item of results) {
                    await this.saveRawData('DockerHub', 'Image', item);
                }
                this.logger.log(`Successfully collected ${results.length} images from Docker Hub.`);
            } else {
                this.logger.warn('No images found from Docker Hub API.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data from Docker Hub', error);
        }
    }
}
