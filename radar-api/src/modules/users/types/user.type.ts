/* eslint-disable prettier/prettier */
import { UUID } from "crypto";

export type UserType = {
    id?: UUID
    email: string;
    name: string;
    metadata?: {
        superTokensUserId: string;
        avatar?: string;
    };
};
