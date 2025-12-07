import { UUID } from 'crypto';
import { Field, ItemClassification } from '@prisma/client';

type BaseItem = {
    title: string;
    summary: string;
    itemField: Field;
};
/**
 * Define el tipo de dato para un crear ítem clasificado en el radar tecnológico.
 */
export type CreateItemType = BaseItem & {
    latestClassificationId: UUID;
};

/**
 * Define el tipo de dato para un ítem creado en el radar tecnológico.
 */
export type ItemWithClassification = BaseItem & {
    id: UUID;
    latestClassification: ItemClassification;
};
