import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { HashnodePostsFetcher } from './hashnode-post.fetcher.service';

export const HASHNODE_FETCHERS: HttpFetcherConstructor[] = [HashnodePostsFetcher];
