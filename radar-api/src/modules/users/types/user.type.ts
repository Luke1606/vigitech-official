/* eslint-disable prettier/prettier */
import { UUID } from "crypto";

export type UserType = {
    id?: UUID;
    profileId: string;
    name: string;
};
