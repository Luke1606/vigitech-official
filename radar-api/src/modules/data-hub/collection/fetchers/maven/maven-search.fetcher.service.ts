import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { MavenArtifact, MavenSearchResponse } from '../../types/maven/maven.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class MavenSearchFetcher extends BaseFetcher {
    private readonly BASE_URL = 'https://search.maven.org/solrsearch/select';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.MAVEN;
    }
    getDatatype(): RawDataType {
        return RawDataType.CODE_ASSET;
    }

    async fetch(): Promise<MavenArtifact[]> {
        this.logger.log('Collecting popular Java/Kotlin artifacts from Maven Central...');

        const query = 'q=g:(org.springframework)+OR+g:(io.quarkus)+OR+g:(org.apache.kafka)';
        const rows = 'rows=100';
        const sort = 'sort=timestamp+desc';

        const apiUrl = `${this.BASE_URL}?${query}&${rows}&${sort}&wt=json`;

        try {
            const response = await lastValueFrom(this.httpService.get<MavenSearchResponse>(apiUrl));
            return response?.data?.response?.docs ?? [];
        } catch (error) {
            this.logger.error('Failed to collect data from Maven Central', error);
            return [];
        }
    }
}
