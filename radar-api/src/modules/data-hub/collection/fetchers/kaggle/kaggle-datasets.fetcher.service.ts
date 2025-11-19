import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { KaggleDataset } from '../../types/kaggle/kaggle.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class KaggleDatasetsFetcher extends BaseFetcher {
    // TODO: La API de Kaggle requiere autenticación CLI.
    // Para producción, se debe buscar una librería o método para autenticar y usar su API.
    private readonly BASE_URL: string = 'https://www.kaggle.com/api/v1/datasets';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.KAGGLE;
    }
    getDatatype(): RawDataType {
        return RawDataType.DATASET;
    }

    async fetch(): Promise<KaggleDataset[]> {
        this.logger.log('Collecting top trending datasets from Kaggle...');

        // Simulación de búsqueda de datasets populares.
        const apiUrl = `${this.BASE_URL}/list?sort_by=hottest&page_size=100`;

        try {
            // Esta llamada es una URL simulada; fallará sin la autenticación adecuada de Kaggle.
            const response = await lastValueFrom(this.httpService.get(apiUrl));
            return (response?.data as KaggleDataset[]) ?? [];
        } catch (error) {
            this.logger.error('Failed to collect data from Kaggle', error);
            throw error;
        }
    }
}
