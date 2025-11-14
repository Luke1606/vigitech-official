import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { GitHubTopic } from '../../types/github/github.types';
import { BaseFetcher } from '../../base.fetcher';
import { GITHUB_BASE_URL } from './base-url';

@Injectable()
export class GitHubTopicFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.GITHUB;
    }

    getDatatype(): RawDataType {
        return RawDataType.REPORT_OR_PRODUCT;
    }

    async fetch(): Promise<GitHubTopic[]> {
        this.logger.log('Collecting all topics with significant usage...');

        // Búsqueda de tópicos con al menos 10 repositorios, ordenados por número de seguidores.
        const apiUrl = `${GITHUB_BASE_URL}/search/topics?q=repositories:>10&sort=followers&order=desc&per_page=100`;

        try {
            const response = await lastValueFrom(this.httpService.get(apiUrl));
            const topics = (response?.data?.items as GitHubTopic[]) ?? [];

            this.logger.log(`Successfully collected ${topics.length} trending Topics.`);
            return topics;
        } catch (error) {
            this.logger.error('Failed to collect Topic data from GitHub', error);
            throw error;
        }
    }
}
