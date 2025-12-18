/**
 * Utilerías para manipulación de fechas.
 * Proporciona funciones para obtener fechas relativas.
 */
export class DateUtils {
    /**
     * Obtiene una fecha que representa "N" días atrás desde la fecha actual.
     * @param days El número de días a restar.
     * @returns Un objeto Date.
     */
    static getDaysAgo(days: number): Date {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date;
    }

    /**
     * Obtiene una fecha que representa "N" horas atrás desde la fecha actual.
     * @param hours El número de horas a restar.
     * @returns Un objeto Date.
     */
    static getHoursAgo(hours: number): Date {
        const date = new Date();
        date.setHours(date.getHours() - hours);
        return date;
    }

    /**
     * Obtiene una fecha que representa "N" minutos atrás desde la fecha actual.
     * @param minutes El número de minutos a restar.
     * @returns Un objeto Date.
     */
    static getMinutesAgo(minutes: number): Date {
        const date = new Date();
        date.setMinutes(date.getMinutes() - minutes);
        return date;
    }
}
