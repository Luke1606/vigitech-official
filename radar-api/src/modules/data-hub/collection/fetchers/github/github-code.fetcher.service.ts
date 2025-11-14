import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { GitHubCodeResult } from '../../types/github/github.types';
import { BaseFetcher } from '../../base.fetcher';
import { GITHUB_BASE_URL } from './base-url';

@Injectable()
export class GitHubCodeFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.GITHUB;
    }

    getDatatype(): RawDataType {
        return RawDataType.CODE_ASSET;
    }

    async fetch(): Promise<GitHubCodeResult[]> {
        this.logger.log('Collecting high volume of generic configuration files (Code Samples)...');

        // Búsqueda amplia por archivos de infraestructura y dependencias comunes.
        const apiUrl = `${GITHUB_BASE_URL}/search/code?q=filename:Dockerfile OR filename:setup.py OR filename:package.json&per_page=100`;

        try {
            const response = await lastValueFrom(this.httpService.get(apiUrl));
            const codeResults = (response?.data?.items as GitHubCodeResult[]) ?? [];

            this.logger.log(`Successfully collected ${codeResults.length} code snippets.`);
            return codeResults;
        } catch (error) {
            this.logger.error('Failed to collect Code data from GitHub', error);
            throw error;
        }
    }
}
