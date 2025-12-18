import { DateUtils } from '../date.util';

describe('DateUtils', () => {
    // Usamos un pequeño margen de tolerancia para los tests de tiempo real (50ms)
    const MARGIN = 50;

    it('getDaysAgo debe restar días correctamente', () => {
        const days = 2;
        const expectedMs = days * 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        const result = DateUtils.getDaysAgo(days).getTime();

        const diff = now - result;
        // La diferencia debe ser igual o ligeramente mayor a los ms esperados
        expect(diff).toBeGreaterThanOrEqual(expectedMs - MARGIN);
    });

    it('getHoursAgo debe restar horas correctamente', () => {
        const hours = 5;
        const expectedMs = hours * 60 * 60 * 1000;
        const now = new Date().getTime();
        const result = DateUtils.getHoursAgo(hours).getTime();

        const diff = now - result;
        expect(diff).toBeGreaterThanOrEqual(expectedMs - MARGIN);
    });

    it('getMinutesAgo debe restar minutos correctamente', () => {
        const minutes = 30;
        const expectedMs = minutes * 60 * 1000;
        const now = new Date().getTime();
        const result = DateUtils.getMinutesAgo(minutes).getTime();

        const diff = now - result;
        expect(diff).toBeGreaterThanOrEqual(expectedMs - MARGIN);
    });
});
