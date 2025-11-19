import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { DockerHubPopularFetcher } from './docker-hub-popular.fetcher.service';

export const DOCKERHUB_FETCHERS: HttpFetcherConstructor[] = [DockerHubPopularFetcher];
