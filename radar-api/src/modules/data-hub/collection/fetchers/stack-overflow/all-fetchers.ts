import { HttpWithConfigFetcherConstructor, HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { StackExchangeTopQuestionsFetcher } from './stack-exchange-top-questions.fetcher.service';
import { StackOverflowSurveyDataFetcher } from './stack-overflow-survey.fetcher.service';

export const STACK_OVERFLOW_FETCHERS: (HttpWithConfigFetcherConstructor | HttpFetcherConstructor)[] = [
    StackExchangeTopQuestionsFetcher,
    StackOverflowSurveyDataFetcher,
];
