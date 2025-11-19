import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { PapersWithCodeTrendingFetcher } from './papers-with-code.fetcher.service';

export const PAPERS_WITH_CODE_FETCHERS: HttpFetcherConstructor[] = [PapersWithCodeTrendingFetcher];
