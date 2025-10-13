import { RadarRing, RadarQuadrant } from "../domain";

const QUADRANT_COLORS: Record<RadarQuadrant, string> = {
    [RadarQuadrant.BUSSINESS_INTEL]: 'business-intel',
    [RadarQuadrant.SCIENTIFIC_STAGE]: 'scientific-stage',
    [RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES]: 'support-platforms',
    [RadarQuadrant.LANGUAGES_AND_FRAMEWORKS]: 'languages'
};

const RING_COLORS: Record<RadarRing, string> = {
    [RadarRing.ADOPT]: 'adopt',
    [RadarRing.TEST]: 'test',
    [RadarRing.SUSTAIN]: 'sustain',
    [RadarRing.HOLD]: 'hold'
};

export const getQuadrantColor = (quadrant: RadarQuadrant) => {
    const colorName = QUADRANT_COLORS[quadrant];
    return `rgb(var(--color-${colorName}))`;
};

export const getQuadrantLightColor = (quadrant: RadarQuadrant) => {
    const colorName = QUADRANT_COLORS[quadrant];
    return `rgb(var(--color-${colorName}-light))`;
};

export const getRingColor = (ring: RadarRing) => {
    const colorName = RING_COLORS[ring];
    return `rgb(var(--color-${colorName}))`;
};

export const getRingLightColor = (ring: RadarRing) => {
    const colorName = RING_COLORS[ring];
    return `rgb(var(--color-${colorName}-light))`;
};