import { HttpWithConfigFetcherConstructor } from '../../types/custom-fetcher.types';
import { SemanticScholarSearchFetcher } from './semantic-scholar-search.fetcher.service';

export const SEMANTIC_SCHOLAR_FETCHERS: HttpWithConfigFetcherConstructor[] = [SemanticScholarSearchFetcher];
