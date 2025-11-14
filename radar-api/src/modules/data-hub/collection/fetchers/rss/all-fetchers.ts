import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { RssFetcher } from './rss.fetcher.service';

export const RSS_FETCHERS: HttpFetcherConstructor[] = [RssFetcher];
