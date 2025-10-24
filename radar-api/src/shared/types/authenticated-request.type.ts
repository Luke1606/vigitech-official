import { User } from '@prisma/client';

export type AuthenticatedRequest = Request & {
    user: User;
};
