import { RadarRing } from "../enums";

export type ChangeLogEntry = {
    itemTitle: string;
    oldRing: RadarRing;
    newRing: RadarRing;
}