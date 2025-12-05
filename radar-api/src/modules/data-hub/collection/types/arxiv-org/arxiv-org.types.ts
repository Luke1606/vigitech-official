/**
 * @file Defines the types for the raw data collected from the arXiv API.
 */

export type ArxivCategory = {
    term: string;
    scheme: string;
};

export type ArxivAuthor = {
    name: string;
};

export type ArxivPaper = {
    id: string;
    title: string;
    summary: string;
    authors: ArxivAuthor[] | ArxivAuthor;
    published: string;
    updated: string;
    categories: ArxivCategory[] | ArxivCategory;
    primaryCategory: ArxivCategory;
    link: string;
};
