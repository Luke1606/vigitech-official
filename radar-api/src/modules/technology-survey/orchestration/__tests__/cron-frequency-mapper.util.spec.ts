import { Frequency } from '@prisma/client';
import { frequencyToCron, findMostAggressiveFrequency } from '../utils/cron-frequency-mapper.util';

describe('CronFrequencyMapper Util', () => {
    describe('frequencyToCron', () => {
        it('debe retornar cron correcto para cada Frequency', () => {
            // Probamos todas las ramas del switch para asegurar 100%
            expect(frequencyToCron(Frequency.EVERY_10_MINUTES)).toBe('*/10 * * * *');
            expect(frequencyToCron(Frequency.EVERY_30_MINUTES)).toBe('*/30 * * * *');
            expect(frequencyToCron(Frequency.HOURLY)).toBe('0 * * * *');
            expect(frequencyToCron(Frequency.EVERY_6_HOURS)).toBe('0 */6 * * *');
            expect(frequencyToCron(Frequency.DAILY)).toBe('0 0 * * *');
            expect(frequencyToCron(Frequency.EVERY_TWO_DAYS)).toBe('0 0 */2 * *');
            expect(frequencyToCron(Frequency.EVERY_FOUR_DAYS)).toBe('0 0 */4 * *');
            expect(frequencyToCron(Frequency.WEEKLY)).toBe('0 0 * * 0');
            // Test del default/fallback
            expect(frequencyToCron('INVALID' as any)).toBe('0 0 * * *');
        });
    });

    describe('findMostAggressiveFrequency', () => {
        it('debe elegir la frecuencia más rápida de una lista', () => {
            const prefs = [
                { recommendationsUpdateFrequency: Frequency.DAILY },
                { recommendationsUpdateFrequency: Frequency.EVERY_10_MINUTES },
                { recommendationsUpdateFrequency: Frequency.WEEKLY },
            ];
            expect(findMostAggressiveFrequency(prefs)).toBe(Frequency.EVERY_10_MINUTES);
        });

        it('debe manejar frecuencias no encontradas en el orden (indexOf === -1)', () => {
            const prefs = [{ recommendationsUpdateFrequency: 'UNKNOWN' as any }];
            // Al no encontrar nada, mantiene el valor por defecto del loop (WEEKLY)
            expect(findMostAggressiveFrequency(prefs)).toBe(Frequency.WEEKLY);
        });

        it('debe devolver DAILY si el resultado final es nulo (cobertura línea 42)', () => {
            // Caso extremo donde FREQUENCY_ORDER[fastestIndex] falle
            expect(findMostAggressiveFrequency([])).toBe(Frequency.WEEKLY);
        });
    });
});
