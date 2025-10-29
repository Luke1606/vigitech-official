export interface CrossRefAffiliation {
    name: string;
}

export interface CrossRefAuthor {
    given?: string;
    family?: string;
    name?: string; // Full name if given and family are not separated
    sequence?: 'first' | 'additional';
    affiliation?: CrossRefAffiliation[];
    ORCID?: string;
}

export interface CrossRefWork {
    DOI: string;
    title: string[];
    abstract?: string;
    author: CrossRefAuthor[];
    'container-title'?: string[]; // Journal or book title
    publisher: string;
    type: string; // e.g., 'journal-article', 'proceedings-article'
    subtype?: string;
    subject?: string[];
    URL: string;
    score?: number; // Relevance score from search
    indexed?: {
        'date-parts': number[][];
        'date-time': string;
        timestamp: number;
    };
    posted?: {
        'date-parts': number[][];
        'date-time': string;
        timestamp: number;
    };
    deposited?: {
        'date-parts': number[][];
        'date-time': string;
        timestamp: number;
    };
    issued?: {
        'date-parts': number[][];
        'date-time': string;
        timestamp: number;
    };
    created?: {
        'date-parts': number[][];
        'date-time': string;
        timestamp: number;
    };
    published?: {
        'date-parts': number[][];
    };
    'reference-count'?: number;
    'is-referenced-by-count'?: number;
    references_count?: number; // Alias for reference-count
    citations_count?: number; // Alias for is-referenced-by-count
    references?: Array<{
        key?: string;
        DOI?: string;
        'doi-asserted-by'?: string;
        'first-page'?: string;
        'journal-title'?: string;
        'volume-title'?: string;
        author?: string;
        year?: string;
        unstructured?: string;
    }>;
    relation?: {
        [key: string]: {
            'id-type': string;
            id: string;
            'asserted-by': string;
        }[];
    };
    link?: {
        URL: string;
        'content-type': string;
        'content-version': string;
        'intended-application': string;
    }[];
    funder?: {
        'funder-name': string;
        'funder-doi'?: string;
        'doi-asserted-by'?: string;
        award?: string[];
    }[];
    assertion?: {
        value: string;
        URL?: string;
        explanation?: string;
        group?: {
            name: string;
            URL?: string;
        };
        name: string;
        order?: number;
    }[];
    license?: {
        URL: string;
        'content-version': string;
        'delay-in-days': number;
        'start-date': string;
    }[];
}

export interface CrossRefMessage {
    'total-results': number;
    items: CrossRefWork[];
    'items-per-page'?: number;
    query?: {
        'start-index'?: number;
        'search-terms'?: string;
        'container-title'?: string;
        author?: string;
        editor?: string;
        funder?: string;
        issn?: string;
        isbn?: string;
        bibliographic?: string;
        title?: string;
        publisher?: string;
        type?: string;
        year?: string;
    };
    'next-cursor'?: string;
}

export interface CrossRefApiResponse {
    status: string;
    'message-type': string;
    'message-version': string;
    message: CrossRefMessage;
}

export interface CrossRefParams {
    query?: string;
    'query.bibliographic'?: string;
    'query.title'?: string;
    'query.author'?: string;
    'query.container-title'?: string;
    filter?: string; // e.g., 'type:journal-article,has-abstract:true'
    sort?:
        | 'relevance'
        | 'deposited'
        | 'indexed'
        | 'issued'
        | 'published'
        | 'updated'
        | 'references-count'
        | 'is-referenced-by-count';
    order?: 'asc' | 'desc';
    rows?: number; // Number of results per page (max 1000)
    offset?: number; // Offset for pagination
    cursor?: string; // Cursor for deep pagination
    select?: string; // Comma-separated list of fields to return
    mailto?: string; // Your email address for polite pool
}
