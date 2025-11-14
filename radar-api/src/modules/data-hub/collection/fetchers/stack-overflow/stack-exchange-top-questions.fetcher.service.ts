// collection/fetchers/stackoverflow/so-top-questions.fetcher.ts
import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RawDataSource, RawDataType } from '@prisma/client';
import { StackExchangeQuestion, StackOverflowApiWrapper } from '../../types/stack-overflow/stack-overflow.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class StackExchangeTopQuestionsFetcher extends BaseFetcher {
    private readonly BASE_URL = 'https://api.stackexchange.com/2.3/';
    private readonly API_KEY: string;
    // TODO: Registre un filtro personalizado en Stack Apps que incluya:
    // default + body + owner.badge_counts (Para tener todos los datos necesarios)
    // Usaremos un filtro de Stack Exchange predefinido para esta demo: 'withbody'
    private readonly FILTER_WITH_BODY = 'withbody';

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        super();
        this.API_KEY = this.configService.get<string>('STACK_EXCHANGE_KEY') || '';
    }

    getDataSource(): RawDataSource {
        return RawDataSource.STACK_EXCHANGE;
    }
    getDatatype(): RawDataType {
        return RawDataType.COMMUNITY_POST;
    }

    async fetch(): Promise<StackExchangeQuestion[]> {
        this.logger.log('Collecting top 50 questions with full body content for RAG...');

        const params = new URLSearchParams({
            site: 'stackoverflow',
            pagesize: '50',
            order: 'desc',
            sort: 'votes',
            tagged: 'nestjs;react;python;rust',
            // 🔑 Asegura que el campo 'body' se incluye en la respuesta
            filter: this.FILTER_WITH_BODY,
        });

        if (this.API_KEY) {
            params.set('key', this.API_KEY);
        }

        const apiUrl = `${this.BASE_URL}questions?${params.toString()}`;

        try {
            const response = await lastValueFrom(
                this.httpService.get<StackOverflowApiWrapper<StackExchangeQuestion>>(apiUrl),
            );

            const questions = response?.data?.items ?? [];
            this.logger.log(`Collected ${questions.length} top Stack Overflow questions.`);
            return questions;
        } catch (error) {
            this.logger.error('Failed to collect data from Stack Exchange API (Check API Key and Filter)', error);
            return [];
        }
    }
}
