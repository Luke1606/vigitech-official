import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { GitHubIssue } from '../../types/github/github.types';
import { BaseFetcher } from '../../base.fetcher';
import { GITHUB_BASE_URL } from './base-url';

@Injectable()
export class GitHubIssueFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.GITHUB;
    }

    getDatatype(): RawDataType {
        return RawDataType.COMMUNITY_POST;
    }

    async fetch(): Promise<GitHubIssue[]> {
        this.logger.log('Collecting high volume of all recent Issues from GitHub...');

        // Búsqueda de cualquier Issue creado o actualizado en los últimos 6 meses.
        const apiUrl = `${GITHUB_BASE_URL}/search/issues?q=is:issue+updated:>2024-06-01&sort=updated&order=desc&per_page=100`;

        try {
            const response = await lastValueFrom(this.httpService.get(apiUrl));
            const items = (response?.data?.items as (GitHubIssue & { pull_request?: unknown })[]) ?? [];

            const issues = items.filter((item) => !item.pull_request) as GitHubIssue[];
            this.logger.log(`Successfully collected ${issues.length} active Issues.`);
            return issues;
        } catch (error) {
            this.logger.error('Failed to collect Issues data from GitHub', error);
            throw error;
        }
    }
}
