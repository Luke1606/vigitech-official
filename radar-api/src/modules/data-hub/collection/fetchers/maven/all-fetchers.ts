import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { MavenSearchFetcher } from './maven-search.fetcher.service';

export const MAVEN_FETCHERS: HttpFetcherConstructor[] = [MavenSearchFetcher];
