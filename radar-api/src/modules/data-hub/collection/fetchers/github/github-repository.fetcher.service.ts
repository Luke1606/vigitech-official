import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { GitHubRepository } from '../../types/github/github.types';
import { BaseFetcher } from '../../base.fetcher';
import { GITHUB_BASE_URL } from './base-url';

@Injectable()
export class GitHubRepositoryFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.GITHUB;
    }

    getDatatype(): RawDataType {
        return RawDataType.CODE_ASSET;
    }

    async fetch(): Promise<GitHubRepository[]> {
        this.logger.log(`Collecting a high volume of recently active repositories from GitHub...`);

        // Búsqueda de repositorios con cualquier número de estrellas, con actividad en el último año.
        const githubApiUrl = `${GITHUB_BASE_URL}/search/repositories?q=stars:>1+pushed:>2024-01-01&sort=updated&order=desc&per_page=100`;

        try {
            const response = await lastValueFrom(this.httpService.get(githubApiUrl));
            const repositories = (response?.data?.items as GitHubRepository[]) ?? [];

            this.logger.log(`Successfully collected ${repositories.length} recently active repositories.`);
            return repositories;
        } catch (error) {
            this.logger.error('Failed to collect repository data from GitHub', error);
            throw error;
        }
    }
}
