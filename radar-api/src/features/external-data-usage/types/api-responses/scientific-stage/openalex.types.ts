export interface OpenAlexWork {
    id: string;
    doi?: string | null;
    title: string;
    display_name?: string;
    publication_date?: string;
    type?: string;
    cited_by_count?: number;
    counts_by_year?: Array<{ year: number; cited_by_count: number }>;
    topics?: Array<{ id: string; display_name: string }>;
    open_access?: { is_oa?: boolean; oa_status?: string };
    best_oa_location?: { is_oa?: boolean; landing_page_url?: string; pdf_url?: string };
}

export interface OpenAlexTrendsResponse {
    results: OpenAlexWork[];
    meta?: { count?: number; next_cursor?: string };
}
