import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { NpmPopularSearchFetcher } from './npm-popular-search.fetcher.service';
import { NpmDownloadsResponse } from '../../types/npm/npm.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class NpmDownloadsFetcher extends BaseFetcher {
    // API de descargas de npm (pública)
    private readonly DOWNLOADS_BASE_URL: string = 'https://api.npmjs.org/downloads/point/last-month/';

    constructor(
        private readonly httpService: HttpService,
        // 🔑 Inyección del fetcher compañero para obtener la lista de nombres
        private readonly searchFetcher: NpmPopularSearchFetcher,
    ) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.NPM;
    }
    getDatatype(): RawDataType {
        return RawDataType.REPORT_OR_PRODUCT;
    }

    /**
     * @description Ejecuta el fetcher de búsqueda para obtener paquetes relevantes y luego
     * consulta las métricas de descarga para esos paquetes.
     * @returns Una promesa que resuelve un array de métricas de descarga válidas.
     */
    async fetch(): Promise<NpmDownloadsResponse[]> {
        this.logger.log('Starting coordinated npm downloads collection...');

        // Paso 1: Obtener la lista dinámica de paquetes usando el fetcher inyectado
        const searchResults = await this.searchFetcher.fetch();

        if (searchResults.length === 0) {
            this.logger.warn('Search fetcher returned no packages. Skipping downloads check.');
            return [];
        }

        const packageNames = searchResults.map((pkg) => pkg.name).slice(0, 100); // Límite de 100
        this.logger.log(`Received ${packageNames.length} names from search fetcher. Proceeding to fetch metrics.`);

        // Paso 2: Consultar las descargas para los paquetes obtenidos
        return this.fetchDownloadsForPackages(packageNames);
    }

    /**
     * Lógica interna para ejecutar la consulta de descargas.
     */
    private async fetchDownloadsForPackages(packageNames: string[]): Promise<NpmDownloadsResponse[]> {
        this.logger.log(`Querying downloads for ${packageNames.length} packages...`);

        const downloadRequests = packageNames.map((name) => {
            const apiUrl = `${this.DOWNLOADS_BASE_URL}${name}`;
            return lastValueFrom(this.httpService.get<NpmDownloadsResponse>(apiUrl));
        });

        // Promise.allSettled para manejar fallos individuales sin detener el proceso
        const responses = await Promise.allSettled(downloadRequests);
        const metrics: NpmDownloadsResponse[] = [];

        responses.forEach((res, index) => {
            const pkgName = packageNames[index];
            if (res.status === 'fulfilled') {
                metrics.push(res.value.data);
            } else {
                this.logger.warn(
                    `Failed to fetch downloads for package [${pkgName}]: ${res.reason?.message || 'Unknown error'}`,
                );
            }
        });

        this.logger.log(`Successfully collected ${metrics.length} valid download metrics.`);
        return metrics;
    }
}
