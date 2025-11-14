// Estructura simplificada para las entidades principales de OpenAlex
export type OpenAlexAuthor = {
    id: string;
    display_name: string;
    orcid?: string;
    works_count?: number;
    cited_by_count?: number;
};

export type OpenAlexSource = {
    id: string;
    display_name: string;
    issn_l?: string;
    type: 'journal' | 'repository' | 'book' | 'conference';
    works_count?: number;
};

export type OpenAlexInstitution = {
    id: string;
    display_name: string;
    ror: string | null;
    country_code: string;
    type: string;
    works_count: number;
};

export type OpenAlexConcept = {
    id: string;
    display_name: string;
    level: number;
    description: string | null;
    works_count: number;
};

export type OpenAlexWork = {
    id: string;
    doi: string | null;
    title: string;
    publication_year: number;
    publication_date: string;
    authorships: {
        author: OpenAlexAuthor;
        institutions: { id: string; display_name: string }[];
    }[];
    primary_location: {
        source: OpenAlexSource;
        landing_page_url: string;
    };
    cited_by_count: number;
    concepts: { id: string; display_name: string; level: number }[];
};

export type OpenAlexResults<T> = {
    // Tipo genérico para envolver la respuesta de la API
    meta: {
        count: number;
        db_response_time_ms: number;
    };
    results: T[];
};
