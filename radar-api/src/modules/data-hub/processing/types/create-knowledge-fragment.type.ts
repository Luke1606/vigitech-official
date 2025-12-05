import { Prisma } from '@prisma/client';
import { UUID } from 'crypto';

/**
 * Define la estructura para crear un nuevo fragmento de conocimiento.
 * Este tipo se utiliza al generar y almacenar fragmentos de conocimiento derivados de datos crudos.
 */
export type CreateKnowledgeFragment = {
    /**
     * Un fragmento de texto conciso y limpio adecuado para la inyección en LLM y la búsqueda semántica.
     */
    textSnippet: string;
    /**
     * El embedding vectorial del fragmento de texto, utilizado para la búsqueda de similitud.
     */
    embedding: number[];
    /**
     * Métricas estructuradas o puntos de datos asociados con el fragmento de conocimiento en formato JSON,
     * que viajan con el vector para la búsqueda híbrida.
     */
    associatedKPIs: Prisma.JsonValue;
    /**
     * El UUID correspondiente a la entrada de datos crudos original de la cual se derivó este fragmento.
     */
    sourceRawDataId: UUID;
};
