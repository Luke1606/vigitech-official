import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { OpenAlexWork } from '../../types/open-alex/open-alex.types';
import { fetchOpenAlex } from './open-alex-common-fetcher';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class OpenAlexWorksFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.OPEN_ALEX;
    }
    getDatatype(): RawDataType {
        return RawDataType.REPORT_OR_PRODUCT;
    }

    async fetch(): Promise<OpenAlexWork[]> {
        this.logger.log('Collecting recent, highly cited research works...');

        const filterParams = {
            filter: `publication_year:>${new Date().getFullYear() - 1},concepts.id:C192591556`, // Computer Science
            sort: 'cited_by_count:desc',
        };

        return fetchOpenAlex<OpenAlexWork>(this.httpService, 'works', filterParams, this.logger);
    }
}
