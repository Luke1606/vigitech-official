import { Blip, RadarQuadrant, RadarRing } from "../../domain";

export const ringBounds: Record<RadarRing, [number, number]> = {
    [RadarRing.ADOPT]: [0, 140],
    [RadarRing.TEST]: [140, 230],
    [RadarRing.SUSTAIN]: [230, 310],
    [RadarRing.HOLD]: [310, 380],
};

export const quadrantAngles: Record<RadarQuadrant, [number, number]> = {
    [RadarQuadrant.LANGUAGES_AND_FRAMEWORKS]: [0, Math.PI / 2],
    [RadarQuadrant.SCIENTIFIC_STAGE]: [Math.PI / 2, Math.PI],
    [RadarQuadrant.BUSSINESS_INTEL]: [Math.PI, (3 * Math.PI) / 2],
    [RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES]: [(3 * Math.PI) / 2, 2 * Math.PI],
};

const generateNonCollidingPosition = (
    ring: RadarRing,
    quadrant: RadarQuadrant,
    existing: { x: number; y: number }[],
    minDistance = 24,
    maxAttempts = 100
): { x: number; y: number } => {
    const [rMin, rMax] = ringBounds[ring];
    const [aMin, aMax] = quadrantAngles[quadrant];
    const safeRMin = rMin + 12;
    const safeRMax = rMax - 12;
    const safeAMin = aMin + 0.1;
    const safeAMax = aMax - 0.1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const radius = Math.sqrt(Math.random() * (safeRMax ** 2 - safeRMin ** 2) + safeRMin ** 2);
        const angle = Math.random() * (safeAMax - safeAMin) + safeAMin;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const tooClose = existing.some((p) => {
            const dx = p.x - x;
            const dy = p.y - y;
            return Math.sqrt(dx * dx + dy * dy) < minDistance;
        });

        if (!tooClose) return { x, y };
    }

    return { x: 0, y: 0 };
}

export const generateBlipPositions = (
    blips: Blip[]
): Record<string, { x: number; y: number }> => {
    const placed: { x: number; y: number }[] = [];
    const positions: Record<string, { x: number; y: number }> = {};

    for (const blip of blips) {
        const pos = generateNonCollidingPosition(blip.radarRing, blip.radarQuadrant, placed);
        placed.push(pos);
        positions[blip.id] = pos;
    }

    return positions;
}

export const isTextOverlapping = (
    x: number,
    y: number,
    existing: {
        x: number;
        y: number
    }[],
    threshold = 20
): boolean => {
    return existing.some((p) => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) < threshold;
    });
}

export const quadrantLabels: {
    label: RadarQuadrant;
    x: number;
    y: number;
    align: 'start' | 'end' 
}[] = [
    {
        label: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
        x: 500,
        y: -300,
        align: 'start'
    },
    {
        label: RadarQuadrant.BUSSINESS_INTEL,
        x: -825,
        y: -300,
        align: 'end'
    },
    {
        label: RadarQuadrant.SCIENTIFIC_STAGE,
        x: -825,
        y: 100,
        align: 'end'
    },
    {
        label: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
        x: 500,
        y: 100,
        align: 'start'
    },
];