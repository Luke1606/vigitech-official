export type UnpaywallWork = {
    doi: string;
    title: string;
    genre: string;
    is_oa: boolean;
    oa_status: string;
    best_oa_location: {
        evidence: string;
        host_type: string;
        is_best: boolean;
        license: string;
        pmh_id: string;
        updated: string;
        url: string;
        url_for_landing_page: string;
        url_for_pdf: string;
        version: string;
    } | null;
    first_oa_location: {
        evidence: string;
        host_type: string;
        is_best: boolean;
        license: string;
        pmh_id: string;
        updated: string;
        url: string;
        url_for_landing_page: string;
        url_for_pdf: string;
        version: string;
    } | null;
    oa_locations: Array<{
        evidence: string;
        host_type: string;
        is_best: boolean;
        license: string;
        pmh_id: string;
        updated: string;
        url: string;
        url_for_landing_page: string;
        url_for_pdf: string;
        version: string;
    }>;
    published_date: string;
    publisher: string;
    journal_name: string;
    journal_issn_l: string;
    journal_issns: string[];
    year: number;
    authors: Array<{
        given: string;
        family: string;
        affiliation: unknown[];
        authenticated_orcid: boolean;
    }>;
    z_authors: Array<{
        given: string;
        family: string;
        affiliation: unknown[];
        authenticated_orcid: boolean;
    }>;
    data_standard: number;
    abstract: string;
    updated: string;
};

export type UnpaywallResponse = {
    results: UnpaywallWork[];
    total: number;
    page: number;
    total_pages: number;
    message: string;
};
