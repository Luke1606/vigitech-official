import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { HackerNewsItem } from '../../types/hacker-news/hacker-news.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class HackerNewsTopFetcher extends BaseFetcher {
    private readonly BASE_URL = 'https://hacker-news.firebaseio.com/v0';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.HACKER_NEWS;
    }
    getDatatype(): RawDataType {
        return RawDataType.COMMUNITY_POST;
    }

    async fetch(): Promise<HackerNewsItem[]> {
        this.logger.log('Collecting top and new stories from Hacker News...');

        const topStoriesUrl = `${this.BASE_URL}/topstories.json`;
        const itemBaseUrl = `${this.BASE_URL}/item/`;

        try {
            // 1. Obtener IDs de las 50 historias principales (máximo de stories en la lista es ~500)
            const idResponse = await lastValueFrom(this.httpService.get<number[]>(topStoriesUrl));
            const topIds = idResponse.data.slice(0, 50);

            // 2. Crear solicitudes para obtener los detalles de cada historia.
            // Usamos Promise.all para la eficiencia.
            const detailRequests = topIds.map((id) =>
                lastValueFrom(this.httpService.get<HackerNewsItem>(`${itemBaseUrl}${id}.json`)),
            );

            const detailResponses = await Promise.all(detailRequests);
            const stories = detailResponses.map((res) => res.data);

            this.logger.log(`Successfully collected ${stories.length} top stories from HN.`);
            return stories;
        } catch (error) {
            this.logger.error('Failed to collect data from Hacker News', error);
            throw error;
        }
    }
}
