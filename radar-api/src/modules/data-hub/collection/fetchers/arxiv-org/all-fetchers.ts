import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { ArxivTargetedFetcher } from './arxiv-org-targeted.fetcher.service';
import { ArxivTrendingFetcher } from './arxiv-org-trending.fetcher.service';

export const ARXIV_FETCHERS: HttpFetcherConstructor[] = [ArxivTrendingFetcher, ArxivTargetedFetcher];
