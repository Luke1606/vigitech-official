import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { PrismaService } from '../../../../../common/services/prisma.service';
import { NpmSearchResponse, NpmPackage } from '../../types/npm.types';

@Injectable()
export class NpmFetcher extends BaseFetcher {
    readonly quadrant = RadarQuadrant.LANGUAGES_AND_FRAMEWORKS; // Or a more appropriate quadrant

    private readonly registryUrl = 'https://registry.npmjs.org';
    private readonly searchUrl = 'https://registry.npmjs.org/-/v1/search';

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async collect(): Promise<void> {
        this.logger.log(`Collecting data from npm Registry for quadrant ${this.quadrant}...`);

        try {
            // Example: Search for popular packages
            const searchResponse = await this.httpService
                .get<NpmSearchResponse>(`${this.searchUrl}?text=popularity&size=10`)
                .toPromise();
            const packages = searchResponse?.data?.objects;

            if (packages && packages.length > 0) {
                for (const pkg of packages) {
                    // Fetch full package metadata for each result
                    const packageMetadataResponse = await this.httpService
                        .get<NpmPackage>(`${this.registryUrl}/${pkg.package.name}`)
                        .toPromise();
                    const fullPackageData = packageMetadataResponse?.data;

                    if (fullPackageData) {
                        await this.saveRawData('npm', 'Package', fullPackageData);
                    }
                }
                this.logger.log(`Successfully collected ${packages.length} packages from npm Registry.`);
            } else {
                this.logger.warn('No packages found from npm Registry search.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data from npm Registry', error);
        }
    }
}
