import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { HackerNewsTopFetcher } from './hacker-news.fetcher.service';

export const HACKERNEWS_FETCHERS: HttpFetcherConstructor[] = [HackerNewsTopFetcher];
