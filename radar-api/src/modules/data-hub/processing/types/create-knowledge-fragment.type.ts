import { Prisma } from '@prisma/client';
import { UUID } from 'crypto';

export type CreateKnowledgeFragment = {
    textSnippet: string;
    embedding: number[];
    associatedKPIs: Prisma.JsonValue;
    sourceRawDataIds: UUID[];
};
