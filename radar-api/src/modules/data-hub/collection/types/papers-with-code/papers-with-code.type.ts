export type PapersWithCodeAuthor = {
    author_id: string;
    name: string;
};

export type PapersWithCodeTask = {
    task: string;
    task_id: string;
};

/**
 * Representa un Paper con Código asociado.
 */
export type PapersWithCodePaper = {
    paper_id: string; // DOI o identificador único
    title: string;
    abstract: string;
    authors: PapersWithCodeAuthor[];
    url_abs: string; // URL al resumen del paper
    url_pdf: string;
    published_date: string; // Añadido para mejor contexto temporal
    // Métricas
    stars: number;
    // Conexión al código
    repository_link: string | null;
    frameworks: string[]; // ej. PyTorch, TensorFlow
    tasks: PapersWithCodeTask[];
};

export type PapersWithCodeSearchResponse = {
    count: number;
    next: string | null;
    results: PapersWithCodePaper[];
};
