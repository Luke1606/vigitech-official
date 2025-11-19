import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { MediaWikiPage, MediaWikiQueryResponse } from '../../types/media-wiki/media-wiki.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class MediaWikiExtractsFetcher extends BaseFetcher {
    private readonly BASE_URL: string = 'https://en.wikipedia.org/w/api.php';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.MEDIA_WIKI;
    }
    getDatatype(): RawDataType {
        return RawDataType.TEXT_CONTENT;
    }

    async fetch(): Promise<MediaWikiPage[]> {
        this.logger.log('Collecting high-quality extracts from Wikipedia on technology topics...');

        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            generator: 'random',
            grnnamespace: '0',
            grnlimit: '10',
            prop: 'extracts|info',
            exchars: '1000',
            explaintext: '1',
            inprop: 'url',
        });

        const apiUrl = `${this.BASE_URL}?${params.toString()}`;

        try {
            const response = await lastValueFrom(this.httpService.get<MediaWikiQueryResponse>(apiUrl));

            const pagesObject = response?.data?.query?.pages;

            if (!pagesObject) return [];

            const pages = Object.values(pagesObject);
            return pages;
        } catch (error) {
            this.logger.error('Failed to collect data from MediaWiki API', error);
            return [];
        }
    }
}
