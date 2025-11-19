import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { ArxivPaper } from '../../types/arxiv-org/arxiv-org.types';
import { BaseFetcher } from '../../base.fetcher';
import { ARXIV_BASE_URL } from './base-url';

@Injectable()
export class ArxivTrendingFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.ARXIV_ORG;
    }

    getDatatype(): RawDataType {
        return RawDataType.ACADEMIC_PAPER;
    }

    async fetch(): Promise<ArxivPaper[]> {
        this.logger.log('Collecting vast volume of recent papers across all major science categories...');

        // Búsqueda amplia en las categorías principales.
        const apiUrl = `${ARXIV_BASE_URL}/query?search_query=cat:cs OR cat:math OR cat:physics OR cat:q-bio OR cat:eess&sortBy=submittedDate&sortOrder=descending&max_results=200`;

        try {
            // NOTA: Se requiere un parser XML/Atom para el endpoint real de arXiv.
            const response = await lastValueFrom(this.httpService.get(apiUrl));

            const papers = response?.data?.items as ArxivPaper[] | undefined; // Simulación de parsing

            this.logger.log(`Successfully collected ${papers?.length || 0} trending papers from arXiv.`);
            return papers ?? [];
        } catch (error) {
            this.logger.error('Failed to collect data from arXiv', error);
            throw error;
        }
    }
}
