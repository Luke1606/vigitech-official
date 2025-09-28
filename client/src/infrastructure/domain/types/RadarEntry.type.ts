import type { UUID } from "crypto";
import type { SurveyItem } from "./SurveyItem.type";

export interface RadarEntry {
    id: UUID;
    quadrant: number;
    ring: number;
    label: string;
    moved: number;
    link?: string;
    color: string;
    originalItem: SurveyItem;
}