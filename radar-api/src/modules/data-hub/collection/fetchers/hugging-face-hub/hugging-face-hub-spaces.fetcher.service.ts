import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { HuggingFaceSpace } from '../../types/hugging-face-hub/hugging-face-hub.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class HuggingFaceHubSpacesFetcher extends BaseFetcher {
    // TODO: Usar la misma API Key de Hugging Face si se requiere aumentar el límite.
    private readonly BASE_URL = 'https://huggingface.co/api';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.HUGGING_FACE_HUB;
    }
    getDatatype(): RawDataType {
        return RawDataType.CODE_ASSET;
    }

    async fetch(): Promise<HuggingFaceSpace[]> {
        this.logger.log('Collecting top trending Spaces (demos) from Hugging Face...');

        // Buscamos los espacios más populares.
        const apiUrl = `${this.BASE_URL}/spaces?sort=likes&direction=-1&limit=50`;

        try {
            const response = await lastValueFrom(this.httpService.get(apiUrl));
            return (response?.data as HuggingFaceSpace[]) ?? [];
        } catch (error) {
            this.logger.error('Failed to collect Spaces data from Hugging Face', error);
            throw error;
        }
    }
}
