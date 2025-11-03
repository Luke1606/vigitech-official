import { RadarQuadrant } from '@prisma/client';

export interface ICollector {
    quadrant: RadarQuadrant;
    collect(): Promise<void>;
}
