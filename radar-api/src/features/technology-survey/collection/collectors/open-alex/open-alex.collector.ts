import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseCollector } from '../../base.collector';
import { PrismaService } from '../../../../../common/services/prisma.service';

@Injectable()
export class OpenAlexCollector extends BaseCollector {
    readonly quadrant = RadarQuadrant.SCIENTIFIC_STAGE;

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async collect(): Promise<void> {
        this.logger.log(`Collecting data from OpenAlex for quadrant ${this.quadrant}...`);

        const openAlexApiUrl = 'https://api.openalex.org/works?sort=cited_by_count:desc&per_page=10';

        try {
            const response = await this.httpService.get(openAlexApiUrl).toPromise();
            const results = response?.data?.results;

            if (results && results.length > 0) {
                for (const item of results) {
                    await this.saveRawData('OpenAlex', 'Work', item); // Formato de saveRawData
                }
                this.logger.log(`Successfully collected ${results.length} works from OpenAlex.`);
            } else {
                this.logger.warn('No works found from OpenAlex API.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data from OpenAlex', error); // Formato de error
        }
    }
}
