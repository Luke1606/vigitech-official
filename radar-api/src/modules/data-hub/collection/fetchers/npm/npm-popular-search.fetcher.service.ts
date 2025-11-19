import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { NpmPackage, NpmSearchResponse } from '../../types/npm/npm.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class NpmPopularSearchFetcher extends BaseFetcher {
    private readonly BASE_URL: string = 'https://registry.npmjs.org/-/v1/search';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.NPM;
    }
    getDatatype(): RawDataType {
        return RawDataType.CODE_ASSET;
    }

    async fetch(): Promise<NpmPackage[]> {
        this.logger.log('Collecting popular and high-quality packages from npm...');

        const params = new URLSearchParams({
            text: 'scope:unscoped keywords:nestjs,react,vue,express',
            size: '100',
            popularity: '1.0',
            quality: '1.0',
        });

        const apiUrl = `${this.BASE_URL}?${params.toString()}`;

        try {
            const response = await lastValueFrom(this.httpService.get<NpmSearchResponse>(apiUrl));

            const packages = response?.data?.objects?.map((obj) => obj.package) ?? [];
            return packages;
        } catch (error) {
            this.logger.error('Failed to collect data from npm search API', error);
            return [];
        }
    }
}
