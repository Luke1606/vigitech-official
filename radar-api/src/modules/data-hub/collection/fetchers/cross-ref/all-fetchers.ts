import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { CrossrefSearchFetcher } from './cross-ref-search.fetcher.service';

export const CROSSREF_FETCHERS: HttpFetcherConstructor[] = [CrossrefSearchFetcher];
