import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { PrismaService } from '../../../../../common/services/prisma.service';
import { NewsApiArticle } from '../../types/newsapi.types'; // Assuming newsapi.types.ts exists

@Injectable()
export class NewsApiFetcher extends BaseFetcher {
    readonly quadrant = RadarQuadrant.SCIENTIFIC_STAGE; // Or a more appropriate quadrant

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async collect(): Promise<void> {
        this.logger.log(`Collecting data from NewsAPI for quadrant ${this.quadrant}...`);

        // NewsAPI URL for general tech news, requires an API key
        const newsApiUrl = `https://newsapi.org/v2/everything?q=technology&sortBy=relevancy&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;

        try {
            const response = await this.httpService.get(newsApiUrl).toPromise();
            const articles: NewsApiArticle[] = response?.data?.articles;

            if (articles && articles.length > 0) {
                for (const article of articles) {
                    await this.saveRawData('NewsAPI', 'Article', article);
                }
                this.logger.log(`Successfully collected ${articles.length} articles from NewsAPI.`);
            } else {
                this.logger.warn('No articles found from NewsAPI.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data from NewsAPI', error);
        }
    }
}
