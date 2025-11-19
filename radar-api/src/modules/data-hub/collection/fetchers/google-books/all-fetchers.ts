import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { GoogleBooksSearchFetcher } from './google-books.fetcher.service';

export const GOOGLEBOOKS_FETCHERS: HttpFetcherConstructor[] = [GoogleBooksSearchFetcher];
