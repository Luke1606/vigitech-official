import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { PrismaService } from '../../../../../common/services/prisma.service';

@Injectable()
export class GitLabFetcher extends BaseFetcher {
    readonly quadrant = RadarQuadrant.LANGUAGES_AND_FRAMEWORKS;

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async collect(): Promise<void> {
        this.logger.log(`Collecting data from GitLab for quadrant ${this.quadrant}...`);

        // GitLab API para obtener proyectos populares o en tendencia
        // Esto es una simplificación y requeriría autenticación y manejo de paginación en un caso real.
        const gitlabApiUrl = 'https://gitlab.com/api/v4/projects?order_by=stars&sort=desc&per_page=10';

        try {
            const response = await this.httpService.get(gitlabApiUrl).toPromise();
            const projects = response?.data;

            if (projects && projects.length > 0) {
                for (const project of projects) {
                    await this.saveRawData('GitLab', 'Project', project);
                }
                this.logger.log(`Successfully collected ${projects.length} projects from GitLab.`);
            } else {
                this.logger.warn('No projects found from GitLab API.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data from GitLab', error);
        }
    }
}
