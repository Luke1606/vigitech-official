import { HttpWithConfigFetcherConstructor } from '../../types/custom-fetcher.types';
import { NewsApiTopHeadlinesFetcher } from './news-api.fetcher.service';

export const NEWSAPI_FETCHERS: HttpWithConfigFetcherConstructor[] = [NewsApiTopHeadlinesFetcher];
