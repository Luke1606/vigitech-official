import type { UUID } from "crypto";

export type UserType = {
    id?: UUID
    email: string;
    name: string;
    metadata: {
        superTokensUserId: string;
        avatar?: string;
    };
};
