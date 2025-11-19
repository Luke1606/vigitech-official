export type SemanticScholarAuthor = {
    authorId: string;
    name: string;
    // Más campos, como afiliación o URL, si se obtienen de un endpoint de autor
};

/**
 * Representa un artículo científico de Semantic Scholar.
 */
export type SemanticScholarPaper = {
    paperId: string;
    externalIds: {
        DOI?: string;
        ArXiv?: string;
        S2Id?: string;
    };
    title: string;
    abstract: string | null;
    authors: SemanticScholarAuthor[];
    url: string; // URL del resumen en S2
    year: number; // Año de publicación
    publicationVenue: { name: string; type: string } | null; // Revista o conferencia
    citationCount: number; // Métrica clave
    fieldsOfStudy: string[] | null; // Categorías
    tldr: { text: string } | null; // Resumen generado por IA
    // Campos para RAG de contexto más amplio:
    references: string[]; // Lista de IDs de papers citados
    citations: string[]; // Lista de IDs de papers que lo citan
};

/**
 * Estructura de la respuesta de búsqueda de la API.
 */
export type SemanticScholarSearchResponse = {
    total: number;
    offset: number;
    next: number;
    data: SemanticScholarPaper[];
};
