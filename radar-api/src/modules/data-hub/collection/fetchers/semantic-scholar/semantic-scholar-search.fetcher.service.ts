import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RawDataSource, RawDataType } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import {
    SemanticScholarPaper,
    SemanticScholarSearchResponse,
} from '../../types/semantic-scholar/semantic-scholar.types';

@Injectable()
export class SemanticScholarSearchFetcher extends BaseFetcher {
    private readonly BASE_URL = 'https://api.semanticscholar.org/graph/v1/paper/search';
    // TODO: Semantic Scholar Graph API requiere un API Key para alta tasa de llamadas.
    private readonly apiKey: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        super();
        this.apiKey = this.configService.get<string>('SEMANTIC_SCHOLAR_KEY') || '';
    }

    getDataSource(): RawDataSource {
        return RawDataSource.SEMANTIC_SCHOLAR;
    }
    getDatatype(): RawDataType {
        return RawDataType.REPORT_OR_PRODUCT;
    }

    async fetch(): Promise<SemanticScholarPaper[]> {
        this.logger.log('Collecting highly-cited computer science papers from Semantic Scholar...');

        if (!this.apiKey) {
            this.logger.warn('SEMANTIC_SCHOLAR_KEY is not configured. Proceeding with public limits.');
        }

        const headers = this.apiKey ? { 'x-api-key': this.apiKey } : {};

        const params = new URLSearchParams({
            query: 'Computer Science, Artificial Intelligence',
            limit: '50',
            // Campos de interés para el RAG
            fields: 'title,abstract,authors,year,citationCount,fieldsOfStudy,externalIds,url,tldr',
        });

        const apiUrl = `${this.BASE_URL}?${params.toString()}`;

        try {
            const response = await lastValueFrom(
                this.httpService.get<SemanticScholarSearchResponse>(apiUrl, { headers }),
            );
            return response?.data?.data ?? [];
        } catch (error) {
            this.logger.error('Failed to collect data from Semantic Scholar API', error);
            return [];
        }
    }
}
