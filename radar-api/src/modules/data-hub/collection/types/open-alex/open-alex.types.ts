/**
 * @file Defines the types for the raw data collected from the OpenAlex API.
 * @description This file contains the type definitions for raw OpenAlex scholarly work data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 */

/**
 * Represents the type of a technology item from OpenAlex.
 * @enum {string}
 */
export type OpenAlexItemType = 'work' | 'concept';

/**
 * Represents a concise OpenAlex Work object (e.g., article, dataset, patent).
 * This type is used for raw data collection before further processing, focusing on key information.
 */
export type OpenAlexWork = {
    id: string; // OpenAlex ID, e.g., "https://openalex.org/W2741809807"
    doi: string | null;
    title: string | null;
    display_name: string | null;
    publication_year: number | null;
    publication_date: string | null; // YYYY-MM-DD
    type: string | null; // e.g., "journal-article", "dataset", "patent"
    cited_by_count: number;
    is_retracted: boolean;
    is_paratext: boolean;
    primary_location: {
        source: {
            id: string | null; // OpenAlex ID for source
            display_name: string | null;
            issn_l: string | null;
            type: string | null; // e.g., "journal", "repository"
        } | null;
    };
    authorships: Array<{
        author: {
            id: string | null; // OpenAlex ID for author
            display_name: string | null;
        };
        institutions: Array<{
            id: string | null; // OpenAlex ID for institution
            display_name: string | null;
        }>;
    }>;
    concepts: Array<{
        id: string; // OpenAlex ID for concept
        display_name: string;
        level: number;
        score: number;
    }>;
    mesh?: Array<{
        descriptor_ui: string;
        descriptor_name: string;
        qualifier_ui: string;
        qualifier_name: string;
        is_major_topic: boolean;
    }>;
    abstract_inverted_index?: Record<string, number[]>; // For full text search, if available
    // Add other relevant fields as needed, but keep it concise for initial implementation
};

/**
 * Represents a concise OpenAlex Concept object.
 * This type is used for raw data collection before further processing, focusing on key information.
 */
export type OpenAlexConcept = {
    id: string; // OpenAlex ID, e.g., "https://openalex.org/C17744445"
    wikidata: string | null;
    display_name: string;
    level: number; // 0-5, 0 being most general
    description: string | null;
    works_count: number;
    cited_by_count: number;
    image_url: string | null;
    international: Record<string, string> | null; // e.g., { "es": "Inteligencia artificial" }
    // Add other relevant fields as needed, but keep it concise for initial implementation
};
