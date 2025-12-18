import { Language, Theme, Frequency } from '@prisma/client';

/**
 * Array de valores válidos para la frecuencia de actualización o análisis.
 * Incluye opciones como DIARIA, CADA_10_MINUTOS, CADA_30_MINUTOS, CADA_6_HORAS,
 * CADA_CUATRO_DIAS, CADA_DOS_DIAS, HORARIA y SEMANAL.
 */
export const FrequencyValue = [
    Frequency.DAILY,
    Frequency.EVERY_10_MINUTES,
    Frequency.EVERY_30_MINUTES,
    Frequency.EVERY_6_HOURS,
    Frequency.EVERY_FOUR_DAYS,
    Frequency.EVERY_TWO_DAYS,
    Frequency.HOURLY,
    Frequency.WEEKLY,
];

/**
 * Array de valores válidos para el tema de la interfaz de usuario.
 * Incluye opciones como DARK (oscuro), LIGHT (claro) y SYSTEM (según la configuración del sistema).
 */
export const ThemeValue = [Theme.DARK, Theme.LIGHT, Theme.SYSTEM];

/**
 * Array de valores válidos para el idioma preferido del usuario.
 * Incluye opciones como EN (inglés) y ES (español).
 */
export const LanguageValue = [Language.EN, Language.ES];
