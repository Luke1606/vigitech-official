import { CrossRefResponse } from './cross-ref-responses.type';
import { OpenAlexResponse } from './open-alex-responses.type';
import { UnpaywallResponse } from './unpaywall-responsestype';

export type CreateGeneralSearchType = {
    crossRefResponse: CrossRefResponse;
    openAlexResponse: OpenAlexResponse;
    unpaywallResponse: UnpaywallResponse;
};
