import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { RedditTopPostsFetcher } from './reddit-top-posts.fetcher.service';

export const REDDIT_FETCHERS: HttpFetcherConstructor[] = [RedditTopPostsFetcher];
