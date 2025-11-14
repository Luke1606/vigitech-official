import { GitHubRepositoryFetcher } from './github-repository.fetcher.service';
import { GitHubIssueFetcher } from './github-issue.fetcher.service';
import { GitHubPullRequestFetcher } from './github-pull-request.fetcher.service';
import { GitHubCodeFetcher } from './github-code.fetcher.service';
import { GitHubTopicFetcher } from './github-topic.fetcher.service';
import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';

export const GITHUB_FETCHERS: HttpFetcherConstructor[] = [
    GitHubRepositoryFetcher,
    GitHubIssueFetcher,
    GitHubPullRequestFetcher,
    GitHubCodeFetcher,
    GitHubTopicFetcher,
];
