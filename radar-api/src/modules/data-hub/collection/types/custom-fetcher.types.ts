import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BaseFetcher } from '../base.fetcher';

export type HttpFetcherConstructor = new (httpService: HttpService) => BaseFetcher;

export type HttpWithConfigFetcherConstructor = new (
    httpService: HttpService,
    configService: ConfigService,
) => BaseFetcher;
