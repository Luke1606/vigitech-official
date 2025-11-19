import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { OpenAlexConcept } from '../../types/open-alex/open-alex.types';
import { fetchOpenAlex } from './open-alex-common-fetcher';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class OpenAlexConceptsFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.OPEN_ALEX;
    }
    getDatatype(): RawDataType {
        return RawDataType.TEXT_CONTENT;
    }

    async fetch(): Promise<OpenAlexConcept[]> {
        this.logger.log('Collecting fundamental concepts (taxonomy) from OpenAlex...');

        const filterParams = {
            filter: 'level:1|level:2',
            sort: 'works_count:desc',
        };

        return fetchOpenAlex<OpenAlexConcept>(this.httpService, 'concepts', filterParams, this.logger);
    }
}
