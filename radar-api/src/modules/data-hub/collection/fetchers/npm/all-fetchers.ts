import { HttpService } from '@nestjs/axios';
import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { NpmDownloadsFetcher } from './npm-download.fetcher.service';
import { NpmPopularSearchFetcher } from './npm-popular-search.fetcher.service';
import { BaseFetcher } from '../../base.fetcher';

export type HttpWithPartnerFetcherConstructor = new (
    httpService: HttpService,
    searchFetcher: NpmPopularSearchFetcher,
) => BaseFetcher;

type NpmFetcherConstructor = HttpFetcherConstructor | HttpWithPartnerFetcherConstructor;

export const NPM_FETCHERS: NpmFetcherConstructor[] = [NpmPopularSearchFetcher, NpmDownloadsFetcher];
