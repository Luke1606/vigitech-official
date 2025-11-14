import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { KaggleCompetitionsFetcher } from './kaggle-competitions.fetcher.service';
import { KaggleDatasetsFetcher } from './kaggle-datasets.fetcher.service';

export const KAGGLE_FETCHERS: HttpFetcherConstructor[] = [KaggleDatasetsFetcher, KaggleCompetitionsFetcher];
