import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { ProductHuntTrendingProductsFetcher } from './product-hunt.fetcher.service';

export const PRODUCT_HUNT_FETCHERS: HttpFetcherConstructor[] = [ProductHuntTrendingProductsFetcher];
