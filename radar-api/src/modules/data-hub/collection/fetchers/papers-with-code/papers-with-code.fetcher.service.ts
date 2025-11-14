import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { PapersWithCodePaper, PapersWithCodeSearchResponse } from '../../types/papers-with-code/papers-with-code.type';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class PapersWithCodeTrendingFetcher extends BaseFetcher {
    private readonly BASE_URL: string = 'https://paperswithcode.com/api/v1/papers';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.PAPERS_WITH_CODE;
    }
    getDatatype(): RawDataType {
        return RawDataType.REPORT_OR_PRODUCT;
    }

    async fetch(): Promise<PapersWithCodePaper[]> {
        this.logger.log('Collecting trending research papers and associated code...');

        // Query: Buscar los papers más populares y recientes ('trending') en Computer Vision o NLP
        const params = new URLSearchParams({
            ordering: '-stars', // Ordenar por más estrellas (popularidad)
            page_size: '50',
            // Filtrar por tareas relevantes:
            q: 'task:object-detection OR task:language-modeling',
        });

        const apiUrl = `${this.BASE_URL}?${params.toString()}`;

        try {
            const response = await lastValueFrom(this.httpService.get<PapersWithCodeSearchResponse>(apiUrl));
            return response?.data?.results ?? [];
        } catch (error) {
            this.logger.error('Failed to collect data from Papers With Code API', error);
            return [];
        }
    }
}
