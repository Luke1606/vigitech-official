import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { PrismaService } from '../../../../../common/services/prisma.service';
import { PypiPackageMetadata } from '../../types/pypi.types';

@Injectable()
export class PypiFetcher extends BaseFetcher {
    readonly quadrant = RadarQuadrant.LANGUAGES_AND_FRAMEWORKS; // Or a more appropriate quadrant

    private readonly baseUrl = 'https://pypi.org/pypi';

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async collect(): Promise<void> {
        this.logger.log(`Collecting data from PyPI for quadrant ${this.quadrant}...`);

        try {
            // PyPI does not have a direct "search by popularity" API.
            // To get popular packages, one might:
            // 1. Use a third-party index that tracks PyPI downloads/popularity.
            // 2. Scrape PyPI's "most downloaded" pages (if available and allowed).
            // 3. Maintain a curated list of known popular packages.

            // For this example, we'll fetch metadata for a few known popular packages.
            const popularPackages = ['requests', 'django', 'flask', 'numpy', 'pandas'];

            for (const packageName of popularPackages) {
                const response = await this.httpService
                    .get<PypiPackageMetadata>(`${this.baseUrl}/${packageName}/json`)
                    .toPromise();
                const packageData = response?.data;

                if (packageData) {
                    await this.saveRawData('PyPI', 'Package', packageData);
                }
            }
            this.logger.log(`Successfully collected metadata for ${popularPackages.length} packages from PyPI.`);
        } catch (error) {
            this.logger.error('Failed to collect data from PyPI', error);
        }
    }
}
