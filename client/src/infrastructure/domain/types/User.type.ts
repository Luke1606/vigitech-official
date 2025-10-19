import type { UUID } from "crypto";

export type UserType = {
    id?: UUID
    clerkId: string;
    name: string;
};
