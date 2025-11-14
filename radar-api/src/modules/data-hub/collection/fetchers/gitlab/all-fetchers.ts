import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { GitLabProjectsFetcher } from './gitlab-projects.fetcher.service';

export const GITLAB_FETCHERS: HttpFetcherConstructor[] = [GitLabProjectsFetcher];
