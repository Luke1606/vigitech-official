import { Classification, Field, Item, Prisma } from '@prisma/client';
import { CreateUnclassifiedItemDto } from '../dto/create-unclassified-item.dto';

type CreateItemClassificationBase = {
    /**
     * Clasificación obtenida
     */
    classification: Classification;
    /**
     * El insight textual (justificación) y las métricas de razonamiento del LLM
     */
    insightsValues: Prisma.InputJsonValue;
    /**
     * Relación inversa para el puntero rápido de 'latestClassification'
     */
    itemAsLatest?: Item;
};

export type CreateNewItemClassification = CreateItemClassificationBase & {
    /**
     * Referencia al item sin clasificar
     */
    unclassifiedItem: CreateUnclassifiedItemDto;

    /**
     * Descripción generada por IA del item sin clasificar
     */
    itemSummary: string;

    /**
     * Campo relacionado del nuevo item
     */
    itemField: Field;
};

export type CreateExistentItemClassification = CreateItemClassificationBase & {
    /**
     * Item a clasificar
     */
    item: Item;
};
