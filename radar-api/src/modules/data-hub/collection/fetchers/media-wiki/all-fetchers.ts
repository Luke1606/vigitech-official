import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { MediaWikiExtractsFetcher } from './media-wiki.fetcher.service';

export const MEDIAWIKI_FETCHERS: HttpFetcherConstructor[] = [MediaWikiExtractsFetcher];
