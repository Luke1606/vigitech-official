// orchestration/utils/cron-frequency-mapper.util.ts

import { Frequency } from '@prisma/client'; // Asegúrate de que la importación sea correcta

/**
 * Convierte un enum Frequency a una expresión cron (string).
 */
export function frequencyToCron(frequency: Frequency): string {
    switch (frequency) {
        case Frequency.EVERY_10_MINUTES:
            return '*/10 * * * *';
        case Frequency.EVERY_30_MINUTES:
            return '*/30 * * * *';
        case Frequency.HOURLY:
            return '0 * * * *';
        case Frequency.EVERY_6_HOURS:
            return '0 */6 * * *';
        case Frequency.DAILY:
            return '0 0 * * *';
        case Frequency.EVERY_TWO_DAYS:
            return '0 0 */2 * *';
        case Frequency.EVERY_FOUR_DAYS:
            return '0 0 */4 * *';
        case Frequency.WEEKLY:
            return '0 0 * * 0';
        default:
            return '0 0 * * *'; // Fallback seguro
    }
}

/**
 * Define el orden de las frecuencias de la más frecuente a la menos frecuente.
 */
const FREQUENCY_ORDER = [
    Frequency.EVERY_10_MINUTES,
    Frequency.EVERY_30_MINUTES,
    Frequency.HOURLY,
    Frequency.EVERY_6_HOURS,
    Frequency.DAILY,
    Frequency.EVERY_TWO_DAYS,
    Frequency.EVERY_FOUR_DAYS,
    Frequency.WEEKLY,
];

/**
 * Encuentra la frecuencia más agresiva (más frecuente) en un arreglo de preferencias
 * de actualización de recomendaciones.
 */
export function findMostAggressiveFrequency(preferences: { recommendationsUpdateFrequency: Frequency }[]): Frequency {
    let fastestIndex = FREQUENCY_ORDER.length - 1;

    for (const pref of preferences) {
        const currentIndex = FREQUENCY_ORDER.indexOf(pref.recommendationsUpdateFrequency);
        if (currentIndex !== -1 && currentIndex < fastestIndex) {
            fastestIndex = currentIndex;
        }
    }

    return FREQUENCY_ORDER[fastestIndex] || Frequency.DAILY;
}
