import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { PrismaService } from '../../../../../common/services/prisma.service';

@Injectable()
export class OpenAlexWorksFetcher extends BaseFetcher {
    readonly quadrants = [RadarQuadrant.SCIENTIFIC_STAGE];

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async fetch(): Promise<void> {
        this.logger.log(`Collecting data from OpenAlex (Works) for quadrants: ${this.quadrants.join(', ')}...`);

        // Implement OpenAlex Works API fetching logic here
        // Example: Search for works related to a specific technology
        const openAlexApiUrl = 'https://api.openalex.org/works?search=technology&per_page=10';

        try {
            const response = await this.httpService.get(openAlexApiUrl).toPromise();
            const works = response?.data?.results;

            if (works && works.length > 0) {
                for (const work of works) {
                    await this.saveRawData('OpenAlex', 'Work', work);
                }
                this.logger.log(`Successfully collected ${works.length} works from OpenAlex.`);
            } else {
                this.logger.warn('No works found from OpenAlex API.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data from OpenAlex (Works)', error);
        }
    }
}
