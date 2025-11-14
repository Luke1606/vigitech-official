import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { OpenAlexInstitution } from '../../types/open-alex/open-alex.types';
import { fetchOpenAlex } from './open-alex-common-fetcher';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class OpenAlexInstitutionsFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.OPEN_ALEX;
    }
    getDatatype(): RawDataType {
        return RawDataType.TEXT_CONTENT;
    }

    async fetch(): Promise<OpenAlexInstitution[]> {
        this.logger.log('Collecting top institutions contributing to research...');

        const filterParams = {
            filter: 'type:education',
            sort: 'works_count:desc',
        };

        return fetchOpenAlex<OpenAlexInstitution>(this.httpService, 'institutions', filterParams, this.logger);
    }
}
