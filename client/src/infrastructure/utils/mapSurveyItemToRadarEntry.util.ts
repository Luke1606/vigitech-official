import { 
    type RadarEntry, 
    type SurveyItem, 
    RadarQuadrant, 
    RadarRing
} from '@/infrastructure';

export const mapSurveyItemToRadarEntry = (
    item: SurveyItem, 
    previousRing?: RadarRing
): RadarEntry => {
    // Mapeo de quadrant enum a índice numérico
    const quadrantMap: Record<RadarQuadrant, number> = {
        [RadarQuadrant.BUSSINESS_INTEL]: 0,
        [RadarQuadrant.SCIENTIFIC_STAGE]: 1,
        [RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES]: 2,
        [RadarQuadrant.LANGUAGES_AND_FRAMEWORKS]: 3
    };

    // Mapeo de ring enum a índice numérico
    const ringMap: Record<RadarRing, number> = {
        [RadarRing.ADOPT]: 0,
        [RadarRing.TEST]: 1,
        [RadarRing.SUSTAIN]: 2,
        [RadarRing.HOLD]: 3
    };

    // Determinar moved status basado en cambios
    let moved = 0; // sin cambios por defecto
    if (previousRing && previousRing !== item.radarRing) {
        const previousRingIndex = ringMap[previousRing];
        const currentRingIndex = ringMap[item.radarRing];
        moved = currentRingIndex < previousRingIndex ? 1 : -1; // 1 = arriba, -1 = abajo
    }

    return {
        id: item.id,
        quadrant: quadrantMap[item.radarQuadrant],
        ring: ringMap[item.radarRing],
        label: item.title,
        moved,
        // Campos adicionales para interactividad
        link: `#${item.id}`, // Para navegación
        color: getRingColor(item.radarRing), // Función helper para colores
        originalItem: item // Mantener referencia al item original
    };
    };

    const getRingColor = (ring: RadarRing): string => {
        const colors = {
            [RadarRing.ADOPT]: "#5ba300",
            [RadarRing.TEST]: "#009eb0", 
            [RadarRing.SUSTAIN]: "#c7ba00",
            [RadarRing.HOLD]: "#e09b96"
        };
    return colors[ring];
};