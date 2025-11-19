import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { HuggingFaceModel } from '../../types/hugging-face-hub/hugging-face-hub.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class HuggingFaceHubModelsDatasetsFetcher extends BaseFetcher {
    // TODO: Para llamadas de alto volumen o información detallada,
    // conseguir una Hugging Face API Key y usarla en los headers.
    private readonly BASE_URL = 'https://huggingface.co/api';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.HUGGING_FACE_HUB;
    }
    getDatatype(): RawDataType {
        return RawDataType.DATASET;
    }

    async fetch(): Promise<HuggingFaceModel[]> {
        this.logger.log('Collecting top trending models from Hugging Face...');

        // Buscamos los modelos más descargados.
        const apiUrl = `${this.BASE_URL}/models?sort=downloads&direction=-1&limit=100`;

        try {
            const response = await lastValueFrom(this.httpService.get(apiUrl));
            return (response?.data as HuggingFaceModel[]) ?? [];
        } catch (error) {
            this.logger.error('Failed to collect models data from Hugging Face', error);
            throw error;
        }
    }
}
