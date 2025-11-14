import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { OpenAlexAuthorsFetcher } from './open-alex-author.fetcher.service';
import { OpenAlexConceptsFetcher } from './open-alex-concept.fetcher.service';
import { OpenAlexInstitutionsFetcher } from './open-alex-institution.fetcher.service';
import { OpenAlexSourcesFetcher } from './open-alex-sources.fetcher.service';
import { OpenAlexWorksFetcher } from './open-alex-work.fetcher.service';

export const OPENALEX_FETCHERS: HttpFetcherConstructor[] = [
    OpenAlexWorksFetcher,
    OpenAlexAuthorsFetcher,
    OpenAlexSourcesFetcher,
    OpenAlexInstitutionsFetcher,
    OpenAlexConceptsFetcher,
];
