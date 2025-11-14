import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { OpenAlexSource } from '../../types/open-alex/open-alex.types';
import { fetchOpenAlex } from './open-alex-common-fetcher';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class OpenAlexSourcesFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.OPEN_ALEX;
    }
    getDatatype(): RawDataType {
        return RawDataType.REPORT_OR_PRODUCT;
    }

    async fetch(): Promise<OpenAlexSource[]> {
        this.logger.log('Collecting top scientific journals and repositories...');

        const filterParams = {
            filter: 'type:journal,works_count:>1000',
            sort: 'works_count:desc',
        };

        return fetchOpenAlex<OpenAlexSource>(this.httpService, 'sources', filterParams, this.logger);
    }
}
