import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { MeetupEventsFetcher } from './meetup-event.fetcher.service';

export const MEETUP_FETCHERS: HttpFetcherConstructor[] = [MeetupEventsFetcher];
