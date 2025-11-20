import { UUID } from 'crypto';
import { Field, Classification } from '@prisma/client';
/**
 * Define el tipo de dato para un ítem clasificado en el radar tecnológico.
 */
export type ClassifiedItemType = {
    id: UUID;
    title: string;
    summary: string;
    itemField: Field;
    classification: Classification;
};
