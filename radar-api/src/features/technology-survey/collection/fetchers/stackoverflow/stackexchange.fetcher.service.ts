import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { PrismaService } from '../../../../../common/services/prisma.service';
import { StackExchangeApiResponse, StackExchangeQuestion } from '../../types/stackoverflow/stackexchange.types';

@Injectable()
export class StackExchangeFetcher extends BaseFetcher {
    readonly quadrant = RadarQuadrant.LANGUAGES_AND_FRAMEWORKS; // Or a more appropriate quadrant

    private readonly baseUrl = 'https://api.stackexchange.com/2.3';
    private readonly site = 'stackoverflow'; // Targeting Stack Overflow specifically

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async collect(): Promise<void> {
        this.logger.log(`Collecting data from Stack Exchange API for quadrant ${this.quadrant}...`);

        try {
            // Fetch popular questions tagged with 'typescript' (example)
            const response = await this.httpService
                .get<
                    StackExchangeApiResponse<StackExchangeQuestion>
                >(`${this.baseUrl}/questions?order=desc&sort=votes&tagged=typescript&site=${this.site}&pagesize=10`)
                .toPromise();
            const questions = response?.data?.items;

            if (questions && questions.length > 0) {
                for (const question of questions) {
                    await this.saveRawData('StackExchange', 'Question', question);
                }
                this.logger.log(`Successfully collected ${questions.length} questions from Stack Exchange.`);
            } else {
                this.logger.warn('No questions found from Stack Exchange API.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data from Stack Exchange API', error);
        }
    }
}
