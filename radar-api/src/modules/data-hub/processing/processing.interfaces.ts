import { RawData, RadarQuadrant } from '@prisma/client';

export interface IProcessor {
    quadrant: RadarQuadrant;
    process(rawData: RawData): Promise<void>;
}
