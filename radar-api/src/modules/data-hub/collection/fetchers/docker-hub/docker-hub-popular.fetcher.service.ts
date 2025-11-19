import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { DockerHubRepository } from '../../types/docker-hub/docker-hub.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class DockerHubPopularFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.DOCKER_HUB;
    }

    getDatatype(): RawDataType {
        return RawDataType.CODE_ASSET; // Representa activos de código (imágenes de contenedor)
    }

    async fetch(): Promise<DockerHubRepository[]> {
        this.logger.log('Collecting high volume of popular Docker Hub repositories...');

        // Búsqueda de imágenes oficiales (namespace=library) ordenadas por pull_count.
        // Docker Hub API requiere autenticación para búsquedas avanzadas, aquí usamos un endpoint público.
        const apiUrl = 'https://hub.docker.com/api/content/v1/products/search?image_filter=official&page_size=100';

        try {
            const response = await lastValueFrom(this.httpService.get(apiUrl));

            // La respuesta de este endpoint es compleja, asumimos la extracción de resultados
            const repositories = (response?.data?.summaries as DockerHubRepository[]) ?? [];

            this.logger.log(`Successfully collected ${repositories.length} Docker Hub repositories.`);
            return repositories;
        } catch (error) {
            this.logger.error('Failed to collect data from Docker Hub', error);
            throw error;
        }
    }
}
