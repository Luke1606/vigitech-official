import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { ARXIV_FETCHERS } from './fetchers/arxiv-org/all-fetchers';
import { CROSSREF_FETCHERS } from './fetchers/cross-ref/all-fetchers';
import { DEVTO_FETCHERS } from './fetchers/dev-to/all-fetchers';
import { DOCKERHUB_FETCHERS } from './fetchers/docker-hub/all-fetchers';
import { GITHUB_FETCHERS } from './fetchers/github/all-fetchers';
import { BaseFetcher } from './base.fetcher';
import { GITLAB_FETCHERS } from './fetchers/gitlab/all-fetchers';
import { GOOGLEBOOKS_FETCHERS } from './fetchers/google-books/all-fetchers';
import { HACKERNEWS_FETCHERS } from './fetchers/hacker-news/all-fetchers';
import { HASHNODE_FETCHERS } from './fetchers/hashnode/all-fetchers';
import { HUGGING_FACE_HUB_FETCHERS } from './fetchers/hugging-face-hub/all-fetchers';
import { KAGGLE_FETCHERS } from './fetchers/kaggle/all-fetchers';
import { MAVEN_FETCHERS } from './fetchers/maven/all-fetchers';
import { MEDIAWIKI_FETCHERS } from './fetchers/media-wiki/all-fetchers';
import { MEETUP_FETCHERS } from './fetchers/meetup/all-fetchers';
import { NEWSAPI_FETCHERS } from './fetchers/news-api/all-fetchers';
import { NPM_FETCHERS } from './fetchers/npm/all-fetchers';
import { OPENALEX_FETCHERS } from './fetchers/open-alex/all-fetchers';
import { FETCHERS_ARRAY_TOKEN } from './constants';
import { PAPERS_WITH_CODE_FETCHERS } from './fetchers/papers-with-code/all-fetchers';
import { STACK_OVERFLOW_FETCHERS } from './fetchers/stack-overflow/all-fetchers';
import { PRODUCT_HUNT_FETCHERS } from './fetchers/product-hunt/all-fetchers';
import { REDDIT_FETCHERS } from './fetchers/reddit/all-fetchers';
import { SEMANTIC_SCHOLAR_FETCHERS } from './fetchers/semantic-scholar/all-fetchers';
import { RSS_FETCHERS } from './fetchers/rss/all-fetchers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ALL_FETCHERS: (new (...args: any[]) => BaseFetcher)[] = [
    ...ARXIV_FETCHERS,
    ...CROSSREF_FETCHERS,
    ...DEVTO_FETCHERS,
    ...DOCKERHUB_FETCHERS,
    ...GITHUB_FETCHERS,
    ...GITLAB_FETCHERS,
    ...GOOGLEBOOKS_FETCHERS,
    ...HACKERNEWS_FETCHERS,
    ...HASHNODE_FETCHERS,
    ...HUGGING_FACE_HUB_FETCHERS,
    ...KAGGLE_FETCHERS,
    ...MAVEN_FETCHERS,
    ...MEDIAWIKI_FETCHERS,
    ...MEETUP_FETCHERS,
    ...NEWSAPI_FETCHERS,
    ...NPM_FETCHERS,
    ...OPENALEX_FETCHERS,
    ...PAPERS_WITH_CODE_FETCHERS,
    ...PRODUCT_HUNT_FETCHERS,
    ...REDDIT_FETCHERS,
    ...RSS_FETCHERS,
    ...SEMANTIC_SCHOLAR_FETCHERS,
    ...STACK_OVERFLOW_FETCHERS,
    // [Aquí se añadirían otros arrays]
];

@Module({
    imports: [HttpModule],
    providers: [
        CollectionService,
        ...ALL_FETCHERS,
        {
            provide: FETCHERS_ARRAY_TOKEN,
            useFactory: (...fetcherInstances: BaseFetcher[]) => {
                Logger.log(`[CollectionModule] Injected ${fetcherInstances.length} data fetchers.`);
                return fetcherInstances;
            },
            inject: ALL_FETCHERS,
        },
    ],
    exports: [CollectionService],
})
export class CollectionModule {}
