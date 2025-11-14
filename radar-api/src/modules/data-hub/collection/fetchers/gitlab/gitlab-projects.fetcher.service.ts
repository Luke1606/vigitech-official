import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { GitLabProject } from '../../types/gitlab/gitlab.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class GitLabProjectsFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.GITLAB;
    }

    getDatatype(): RawDataType {
        return RawDataType.CODE_ASSET;
    }

    async fetch(): Promise<GitLabProject[]> {
        this.logger.log('Collecting high volume of popular/active projects from GitLab...');

        // Consulta de proyectos activos y populares (ordenados por actividad y estrellados)
        const apiUrl =
            'https://gitlab.com/api/v4/projects?starred_after=2024-01-01&order_by=last_activity_at&per_page=100';

        try {
            const response = await lastValueFrom(this.httpService.get(apiUrl));

            const projects = (response?.data as GitLabProject[]) ?? [];

            this.logger.log(`Successfully collected ${projects.length} active projects from GitLab.`);
            return projects;
        } catch (error) {
            this.logger.error('Failed to collect data from GitLab', error);
            // NOTA: Para producción, se requeriría un Token de acceso privado de GitLab.
            // TODO conseguir token privado de gitlab
            throw error;
        }
    }
}
