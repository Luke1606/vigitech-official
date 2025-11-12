import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { PrismaService } from '../../../../../common/services/prisma.service';

@Injectable()
export class GitHubFetcher extends BaseFetcher {
    readonly quadrants = [RadarQuadrant.LANGUAGES_AND_FRAMEWORKS];

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async fetch(): Promise<void> {
        this.logger.log(`Collecting data from GitHub for quadrants: ${this.quadrants.join(', ')}...`);

        // Ejemplo: Obtener repositorios populares (esto es una simplificación)
        // En un caso real, se usaría la API de GitHub para buscar tendencias de lenguajes/frameworks
        const githubApiUrl =
            'https://api.github.com/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=10';

        try {
            const response = await this.httpService.get(githubApiUrl).toPromise();
            const repositories = response?.data?.items;

            if (repositories && repositories.length > 0) {
                for (const repo of repositories) {
                    await this.saveRawData('GitHub', 'Repository', repo);
                }
                this.logger.log(`Successfully collected ${repositories.length} repositories from GitHub.`);
            } else {
                this.logger.warn('No repositories found from GitHub API.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data from GitHub', error);
        }
    }
}
