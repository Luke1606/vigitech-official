import { UUID } from 'crypto';
import { Request } from 'express';

export type AuthenticatedRequest = Request & {
    userId?: UUID;
};
