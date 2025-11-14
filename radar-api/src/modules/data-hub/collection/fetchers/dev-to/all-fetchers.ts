import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { DevToArticlesFetcher } from './dev-to-article.fetcher.service';

export const DEVTO_FETCHERS: HttpFetcherConstructor[] = [DevToArticlesFetcher];
