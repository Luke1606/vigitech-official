import { RawDataSource, RawDataType } from '@prisma/client';

/**
 * Type para encapsular los parámetros de consulta de búsqueda.
 * Permite definir criterios para búsquedas por identidad, semánticas y filtrado de datos.
 * @class SearchQueryDto
 */
export class SearchQuery {
    /**
     * Cadena de texto para la búsqueda por palabras clave o semántica.
     * @type {string}
     */
    query?: string;

    /**
     * Array de fuentes de datos (`RawDataSource`) para filtrar los resultados.
     * @type {RawDataSource[]}
     */
    sources?: RawDataSource[];

    /**
     * Array de tipos de datos brutos (`RawDataType`) para filtrar los resultados.
     * @type {RawDataType[]}
     */
    dataTypes?: RawDataType[];

    // --- FILTROS DE FECHA ---

    /**
     * Filtra fragmentos creados a partir de esta fecha (ISO 8601, ej: 2024-01-01T00:00:00Z).
     * El servicio asumirá que se aplica al campo `createdAt`.
     * @type {Date}
     */
    startDate?: Date;

    /**
     * Filtra fragmentos creados antes de esta fecha (ISO 8601, ej: 2024-12-31T23:59:59Z).
     * El servicio asumirá que se aplica al campo `createdAt`.
     * @type {Date}
     */
    endDate?: Date;

    // --- PAGINACIÓN Y BÚSQUEDA VECTORIAL ---

    /**
     * Límite de resultados a devolver.
     * @type {number}
     */
    limit?: number = 10;

    /**
     * Offset para la paginación de resultados.
     * @type {number}
     */
    offset?: number = 0;

    /**
     * Número de vecinos más cercanos a recuperar para la búsqueda semántica (k-NN).
     * Solo aplica si `query` está presente.
     * @type {number}
     */
    k?: number = 5; // For semantic search: number of nearest neighbors
}
