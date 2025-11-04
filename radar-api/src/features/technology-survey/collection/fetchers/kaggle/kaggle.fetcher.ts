import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { PrismaService } from '../../../../../common/services/prisma.service';

@Injectable()
export class KaggleFetcher extends BaseFetcher {
    readonly quadrant = RadarQuadrant.BUSSINESS_INTEL;

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async collect(): Promise<void> {
        this.logger.log(`Collecting data from Kaggle for quadrant ${this.quadrant}...`);

        // Ejemplo: Obtener datasets populares o en tendencia (simplificación)
        // En un caso real, se usaría la API de Kaggle para buscar datasets, notebooks o competiciones
        // relevantes para Business Intelligence.
        const kaggleApiUrl = 'https://www.kaggle.com/api/v1/datasets/list?sort_by=votes&page=1&page_size=10'; // URL de ejemplo, la API real requiere autenticación y es más compleja

        try {
            // Nota: La API pública de Kaggle es limitada. Para un uso real, se necesitaría autenticación
            // y posiblemente un cliente SDK o web scraping si la API no expone lo necesario.
            // Este es un placeholder.
            const response = await this.httpService.get(kaggleApiUrl).toPromise();
            const datasets = response?.data;

            if (datasets && datasets.length > 0) {
                for (const dataset of datasets) {
                    await this.saveRawData('Kaggle', 'Dataset', dataset);
                }
                this.logger.log(`Successfully collected ${datasets.length} datasets from Kaggle.`);
            } else {
                this.logger.warn('No datasets found from Kaggle API.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data from Kaggle', error);
        }
    }
}
