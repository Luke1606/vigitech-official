import { Language, Theme, Frequency } from '@prisma/client';

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

export const ThemeValue = [Theme.DARK, Theme.LIGHT, Theme.SYSTEM];

export const LanguageValue = [Language.EN, Language.ES];
