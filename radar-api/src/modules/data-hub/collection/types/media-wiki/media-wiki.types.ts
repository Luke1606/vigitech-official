// Basado en la API de acción de MediaWiki (ej. Wikipedia)
export type MediaWikiPage = {
    pageid: number;
    ns: number;
    title: string;
    // Contenido de la página (propiedad 'extract' de la consulta 'prop=extracts')
    extract: string;
    // Metadatos adicionales de revisiones o links
    touched: string;
    lastrevid: number;
    length: number;
};

export type MediaWikiQueryResponse = {
    query: {
        pages: Record<string, MediaWikiPage>; // Las páginas vienen indexadas por ID
    };
};
