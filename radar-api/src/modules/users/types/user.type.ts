/* eslint-disable prettier/prettier */
import { UUID } from "crypto";

export type UserType = {
    id?: UUID;
    clerkId: string;
    name: string;
};
