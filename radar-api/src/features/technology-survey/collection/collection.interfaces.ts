import { RadarQuadrant } from '@prisma/client';

export interface IFetcher {
    quadrant: RadarQuadrant;
    collect(): Promise<void>;
}
