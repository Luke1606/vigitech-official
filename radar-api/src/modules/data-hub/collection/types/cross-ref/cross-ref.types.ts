/**
 * Define los tipos para la respuesta de la API de Crossref (Fondo Abierto).
 */
export type CrossrefAuthor = {
    given: string;
    family: string;
};

export type CrossrefWork = {
    DOI: string;
    title: string[]; // Título completo
    subtitle: string[];
    author: CrossrefAuthor[];
    'container-title': string[]; // Nombre de la revista o conferencia
    issued: {
        'date-parts': number[][];
    };
    link: { URL: string }[];
    type: string; // Ej: journal-article, proceedings-article, book
    abstract?: string; // El resumen generalmente se obtiene a través de un endpoint adicional, pero lo tipificamos.
};

export type CrossrefApiResult = {
    'message-version': string;
    message: {
        'items-per-page': number;
        items: CrossrefWork[];
    };
};
