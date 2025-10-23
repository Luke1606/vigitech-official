export type CrossRefWork = {
    doi: string;
    title: string[];
    abstract?: string;
    author: Array<{
        given?: string;
        family?: string;
        name?: string;
        ORCID?: string;
        affiliation?: unknown[];
    }>;
    published: {
        'date-parts': number[][];
    };
    publisher: string;
    subtype: string;
    type: string;
    subject: string[];
    'reference-count': number;
    'is-referenced-by-count': number;
    URL: string;
    created: {
        'date-time': string;
        timestamp: number;
    };
    deposited: {
        'date-time': string;
        timestamp: number;
    };
    issued: {
        'date-parts': number[][];
    };
    references?: Array<{
        DOI: string;
        key: string;
        'doi-asserted-by': string;
    }>;
    relation: {
        [key: string]: unknown;
    };
};

export type CrossRefResponse = {
    status: string;
    'message-type': string;
    'message-version': string;
    message: {
        items: CrossRefWork[];
        'total-results': number;
        'items-per-page': number;
        query: {
            'start-index': number;
            'search-terms': string;
        };
    };
};

export type CrossRefParams = {
    query?: string;
    rows?: number;
    sort?: string;
    order?: 'desc' | 'asc';
    filter?: string;
    mailto?: string;
};
