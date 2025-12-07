import { Classification } from '@prisma/client';
import { UUID } from 'crypto';

export type ClassificationChange = {
    itemId: UUID;
    newClassification: Classification;
};
