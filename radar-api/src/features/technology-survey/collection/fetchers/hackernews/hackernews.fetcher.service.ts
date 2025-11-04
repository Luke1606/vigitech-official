import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { PrismaService } from '../../../../../common/services/prisma.service';
import { HackerNewsItem } from '../../types/hackernews.types';

@Injectable()
export class HackerNewsFetcher extends BaseFetcher {
    readonly quadrants = [RadarQuadrant.LANGUAGES_AND_FRAMEWORKS, RadarQuadrant.SCIENTIFIC_STAGE]; // Hacker News can cover multiple quadrants

    private readonly baseUrl = 'https://hacker-news.firebaseio.com/v0';

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async fetch(): Promise<void> {
        this.logger.log(`Collecting data from Hacker News for quadrants: ${this.quadrants.join(', ')}...`);

        try {
            // Get top story IDs
            const topStoryIdsResponse = await this.httpService
                .get<number[]>(`${this.baseUrl}/topstories.json`)
                .toPromise();
            const topStoryIds = topStoryIdsResponse?.data?.slice(0, 10); // Limit to top 10 for example

            if (topStoryIds && topStoryIds.length > 0) {
                for (const id of topStoryIds) {
                    const itemResponse = await this.httpService
                        .get<HackerNewsItem>(`${this.baseUrl}/item/${id}.json`)
                        .toPromise();
                    const item = itemResponse?.data;

                    if (item) {
                        await this.saveRawData('HackerNews', item.type, item);
                    }
                }
                this.logger.log(`Successfully collected ${topStoryIds.length} top stories from Hacker News.`);
            } else {
                this.logger.warn('No top stories found from Hacker News API.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data from Hacker News', error);
        }
    }
}
