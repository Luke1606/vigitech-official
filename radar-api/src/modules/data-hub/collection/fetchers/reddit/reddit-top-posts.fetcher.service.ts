import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { RawDataSource, RawDataType } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { RedditListing, RedditPost } from '../../types/reddit/reddit.types';

@Injectable()
export class RedditTopPostsFetcher extends BaseFetcher {
    // Reddit requiere una clave API (OAuth) para la producción, pero el endpoint JSON público a menudo funciona para lectura.
    private readonly BASE_URL = 'https://www.reddit.com/r/';
    private readonly TARGET_SUBREDDITS = ['MachineLearning', 'ProgrammerHumor', 'AskScience', 'webdev'];

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.REDDIT;
    }
    getDatatype(): RawDataType {
        return RawDataType.COMMUNITY_POST;
    }

    async fetch(): Promise<RedditPost[]> {
        this.logger.log('Collecting top posts from target subreddits...');

        const allPosts: RedditPost[] = [];

        const fetchPromises = this.TARGET_SUBREDDITS.map(async (subreddit) => {
            // Obtener los 10 posts más "hot"
            const apiUrl = `${this.BASE_URL}${subreddit}/hot.json?limit=10`;

            // Nota: Reddit requiere un User-Agent en los headers para evitar ser bloqueado.
            const headers = { 'User-Agent': 'CustomDataCollector/1.0 (by /u/YourRedditUsername)' };

            try {
                const response = await lastValueFrom(this.httpService.get<RedditListing>(apiUrl, { headers }));
                const posts = response.data.data.children.map((child) => child.data);
                this.logger.log(`Collected ${posts.length} posts from r/${subreddit}`);
                allPosts.push(...posts);
            } catch (error) {
                this.logger.error(`Failed to fetch r/${subreddit}`, error);
            }
        });

        await Promise.all(fetchPromises);

        return allPosts;
    }
}
