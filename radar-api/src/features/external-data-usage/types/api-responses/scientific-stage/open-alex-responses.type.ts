export interface OpenAlexCountsByYear {
    year: number;
    works_count: number;
    cited_by_count: number;
}

export interface OpenAlexAuthor {
    id: string;
    display_name: string;
    orcid?: string;
    works_count?: number;
    cited_by_count?: number;
    dois_count?: number;
    last_known_institution?: OpenAlexInstitution;
    x_concepts?: OpenAlexConcept[];
    counts_by_year?: OpenAlexCountsByYear[];
    created_date?: string;
    updated_date?: string;
}

export interface OpenAlexInstitution {
    id: string;
    ror?: string;
    display_name: string;
    country_code?: string;
    type?: string; // e.g., 'education', 'healthcare'
    homepage_url?: string;
    works_count?: number;
    cited_by_count?: number;
    x_concepts?: OpenAlexConcept[];
    counts_by_year?: OpenAlexCountsByYear[];
    created_date?: string;
    updated_date?: string;
}

export interface OpenAlexConcept {
    id: string;
    wikidata?: string;
    display_name: string;
    level?: number;
    description?: string;
    works_count?: number;
    cited_by_count?: number;
    image_url?: string;
    international?: {
        display_name: {
            [key: string]: string; // e.g., { "en": "Computer science", "es": "Ciencias de la computación" }
        };
    };
    counts_by_year?: OpenAlexCountsByYear[];
    created_date?: string;
    updated_date?: string;
}

export interface OpenAlexSource {
    id: string;
    issn_l?: string;
    issn?: string[];
    display_name: string;
    publisher?: string;
    type?: string; // e.g., 'journal', 'repository'
    works_count?: number;
    cited_by_count?: number;
    x_concepts?: OpenAlexConcept[];
    counts_by_year?: OpenAlexCountsByYear[];
    created_date?: string;
    updated_date?: string;
}

export interface OpenAlexWork {
    id: string;
    doi?: string;
    title: string;
    display_name: string;
    publication_year: number;
    publication_date: string;
    type: string;
    cited_by_count: number;
    is_retracted: boolean;
    is_paratext: boolean;
    primary_location?: {
        source?: OpenAlexSource;
        landing_page_url?: string;
        pdf_url?: string;
        is_oa?: boolean;
        version?: string;
        license?: string;
    };
    authorships?: {
        author: OpenAlexAuthor;
        institutions: OpenAlexInstitution[];
        is_corresponding: boolean;
        raw_affiliation_string?: string;
    }[];
    corresponding_author_ids?: string[];
    corresponding_institution_ids?: string[];
    countries_distinct_count?: number;
    institutions_distinct_count?: number;
    concepts?: {
        id: string;
        wikidata?: string;
        display_name: string;
        level: number;
        score: number;
    }[];
    mesh?: {
        descriptor_ui: string;
        descriptor_name: string;
        qualifier_ui: string;
        qualifier_name: string;
        is_major_topic: boolean;
    }[];
    grants?: {
        funder: string;
        funder_display_name: string;
        award_id?: string;
    }[];
    referenced_works?: string[]; // List of OpenAlex IDs
    related_works?: string[]; // List of OpenAlex IDs
    abstract_inverted_index?: {
        [word: string]: number[];
    };
    fulltext_origin?: string;
    apc_list?: {
        value: number;
        currency: string;
        provenance: string;
        value_usd: number;
    };
    apc_paid?: {
        value: number;
        currency: string;
        provenance: string;
        value_usd: number;
    };
    has_fulltext?: boolean;
    fulltext_url?: string;
    biblio?: {
        volume?: string;
        issue?: string;
        first_page?: string;
        last_page?: string;
    };
    is_open_access?: boolean;
    open_access?: {
        is_oa: boolean;
        oa_status: 'gold' | 'green' | 'bronze' | 'hybrid' | 'closed';
        oa_url?: string;
    };
    citations_api_url?: string;
    ngrams_url?: string;
    version?: string;
    license?: string;
    best_oa_location?: {
        source?: OpenAlexSource;
        landing_page_url?: string;
        pdf_url?: string;
        is_oa?: boolean;
        version?: string;
        license?: string;
    };
    sustainable_development_goals?: {
        id: string;
        display_name: string;
        score: number;
    }[];
    topics?: {
        id: string;
        display_name: string;
        score: number;
    }[];
    alternate_host_venues?: {
        id: string;
        display_name: string;
        type: string;
        url: string;
        is_global: boolean;
        is_oa: boolean;
        license: string;
        version: string;
    }[];
    relevance_score?: number; // From search results
    language?: string;
    grants_count?: number;
    patents_count?: number;
    authors_count?: number;
    institutions_count?: number;
    funders_count?: number;
    sources_count?: number;
    concepts_count?: number;
    keywords?: string[];
    abstract?: string; // Re-added for consistency, though inverted index is more common
    counts_by_year?: OpenAlexCountsByYear[];
    created_date?: string;
    updated_date?: string;
}

export interface OpenAlexMeta {
    count: number;
    db_response_time_ms: number;
    page?: number;
    per_page?: number;
    next_cursor?: string;
}

export interface OpenAlexApiResponse<T> {
    results: T[];
    meta: OpenAlexMeta;
    group_by?: {
        key: string;
        key_display_name: string;
        count: number;
    }[];
}

export interface OpenAlexParams {
    filter?: string; // e.g., 'authors.id:A12345,publication_year:2020'
    search?: string; // Full-text search
    'search.title'?: string;
    'search.abstract'?: string;
    'search.fulltext'?: string;
    group_by?: 'publication_year' | 'authors.id' | 'institutions.id' | 'concepts.id' | 'sources.id' | 'topics.id';
    sort?: 'relevance' | 'cited_by_count' | 'publication_date';
    order?: 'asc' | 'desc';
    per_page?: number; // Max 200
    page?: number;
    cursor?: string;
    mailto?: string; // Your email for polite pool
    select?: string; // Comma-separated list of fields to return
}
