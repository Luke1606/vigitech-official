import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RawDataSource, RawDataType } from '@prisma/client';
import { NewsArticle, NewsApiResponse } from '../../types/news-api/news-api.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class NewsApiTopHeadlinesFetcher extends BaseFetcher {
    // TODO conseguir apikey de newsapi
    private readonly BASE_URL = 'https://newsapi.org/v2/everything';
    private readonly apiKey: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        super();
        this.apiKey = this.configService.get<string>('NEWS_API_KEY') || ''; // Asumir ENV: NEWS_API_KEY
    }

    getDataSource(): RawDataSource {
        return RawDataSource.NEWS_API;
    }
    getDatatype(): RawDataType {
        return RawDataType.TEXT_CONTENT;
    }

    async fetch(): Promise<NewsArticle[]> {
        this.logger.log('Collecting recent articles on AI and Data Science from NewsAPI...');

        if (!this.apiKey) {
            this.logger.error('NEWS_API_KEY is not configured. Skipping fetch.');
            return [];
        }

        const params = new URLSearchParams({
            q: 'AI OR "Data Science" OR "Machine Learning"',
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: '100',
            apiKey: this.apiKey, // Usando la clave inyectada
        });

        const apiUrl = `${this.BASE_URL}?${params.toString()}`;

        try {
            const response = await lastValueFrom(this.httpService.get<NewsApiResponse>(apiUrl));

            if (response.data.status === 'error') {
                this.logger.error(`NewsAPI returned an error: ${response.status} - ${response.statusText}`);
                return [];
            }

            return response?.data?.articles ?? [];
        } catch (error) {
            this.logger.error('Failed to collect data from NewsAPI', error);
            return [];
        }
    }
}
