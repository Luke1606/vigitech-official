export type OpenAlexTopic = {
    id: string;
    display_name: string;
    description: string | null;
    keywords: string[];
    subfield: { display_name: string } | null;
    field: { display_name: string } | null;
    domain: { display_name: string } | null;
    works_count: number;
    cited_by_count: number;
    created_date: string;
    updated_date: string;
};

export type OpenAlexWork = {
    id: string;
    title: string;
    display_name: string;
    publication_year: number;
    publication_date: string;
    type: string;
    cited_by_count: number;
    is_retracted: boolean;
    is_paratext: boolean;
    topics: {
        topic: OpenAlexTopic;
        score: number;
    }[];
    abstract: string;
    related_works: string[];
};

export type OpenAlexResponse = {
    results: OpenAlexTopic[] | OpenAlexWork[];
    meta: {
        count: number;
        db_response_time_ms: number;
        page: number;
        per_page: number;
    };
};
