import { RadarQuadrant } from '@prisma/client';

export interface IFetcher {
    quadrants: RadarQuadrant[];
    fetch(): Promise<void>;
}
