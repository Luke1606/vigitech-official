import { CrossRefResponse } from './cross-ref-responses.type';
import { OpenAlexResponse } from '../../../../dist/survey-items/external-actors/types/open-alex-entities.type';
import { UnpaywallResponse } from './unpaywall-responsestype';

export type CreateGeneralSearchType = {
    crossRefResponse: CrossRefResponse;
    openAlexResponse: OpenAlexResponse;
    unpaywallResponse: UnpaywallResponse;
};
