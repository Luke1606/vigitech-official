import { RadarRing } from "../enums";
import { SurveyItem } from "./entities";

export type Blip = SurveyItem & { previousRing?: RadarRing;
};