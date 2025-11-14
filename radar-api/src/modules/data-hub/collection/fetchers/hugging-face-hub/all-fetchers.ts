import { HttpFetcherConstructor } from '../../types/custom-fetcher.types';
import { HuggingFaceHubSpacesFetcher } from './hugging-face-hub-spaces.fetcher.service';
import { HuggingFaceHubModelsDatasetsFetcher } from './hugging-face-hub-models-datasets.fetcher.service';

export const HUGGING_FACE_HUB_FETCHERS: HttpFetcherConstructor[] = [
    HuggingFaceHubModelsDatasetsFetcher,
    HuggingFaceHubSpacesFetcher,
];
