import { CrossRefResponse } from './api-responses/scientific-stage/cross-ref-responses.type';
import { OpenAlexResponse } from './api-responses/scientific-stage/open-alex-responses.type';

export type CreateGeneralSearchType = {
    crossRefResponse: CrossRefResponse;
    openAlexResponse: OpenAlexResponse;
};
