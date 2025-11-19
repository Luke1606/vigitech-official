import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { GitHubPullRequest } from '../../types/github/github.types';
import { BaseFetcher } from '../../base.fetcher';
import { GITHUB_BASE_URL } from './base-url';

@Injectable()
export class GitHubPullRequestFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.GITHUB;
    }

    getDatatype(): RawDataType {
        return RawDataType.CODE_ASSET;
    }

    async fetch(): Promise<GitHubPullRequest[]> {
        this.logger.log('Collecting high volume of recent Pull Requests from GitHub...');

        // Búsqueda de cualquier PR creado o actualizado en los últimos 3 meses.
        const apiUrl = `${GITHUB_BASE_URL}/search/issues?q=is:pr+updated:>2024-09-01&sort=updated&order=desc&per_page=100`;

        try {
            const response = await lastValueFrom(this.httpService.get(apiUrl));
            const items = (response?.data?.items as GitHubPullRequest[]) ?? [];

            const pullRequests = items.filter((item) => item.pull_request);
            this.logger.log(`Successfully collected ${pullRequests.length} recent PRs.`);
            return pullRequests;
        } catch (error) {
            this.logger.error('Failed to collect Pull Request data from GitHub', error);
            throw error;
        }
    }
}
