import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { OpenAlexAuthor } from '../../types/open-alex/open-alex.types';
import { fetchOpenAlex } from './open-alex-common-fetcher';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class OpenAlexAuthorsFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.OPEN_ALEX;
    }
    getDatatype(): RawDataType {
        return RawDataType.COMMUNITY_POST;
    }

    async fetch(): Promise<OpenAlexAuthor[]> {
        this.logger.log('Collecting highly cited authors in Computer Science...');

        const filterParams = {
            filter: 'last_known_institution.concepts.id:C192591556',
            sort: 'cited_by_count:desc',
        };

        return fetchOpenAlex<OpenAlexAuthor>(this.httpService, 'authors', filterParams, this.logger);
    }
}
