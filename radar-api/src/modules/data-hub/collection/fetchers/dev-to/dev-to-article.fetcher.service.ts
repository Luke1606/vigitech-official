import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { DevToArticle } from '../../types/dev-to/dev-to.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class DevToArticlesFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.DEV_TO;
    }

    getDatatype(): RawDataType {
        return RawDataType.COMMUNITY_POST;
    }

    async fetch(): Promise<DevToArticle[]> {
        this.logger.log('Collecting high volume of recent articles from Dev.to...');

        // Buscamos artículos recientes (per_page=100) y ordenados por fecha.
        const apiUrl = 'https://dev.to/api/articles?per_page=100&top=1&period=month';

        try {
            const response = await lastValueFrom(this.httpService.get(apiUrl));

            const articles = (response?.data as DevToArticle[]) ?? [];

            this.logger.log(`Successfully collected ${articles.length} articles from Dev.to.`);
            return articles;
        } catch (error) {
            this.logger.error('Failed to collect data from Dev.to', error);
            throw error;
        }
    }
}
