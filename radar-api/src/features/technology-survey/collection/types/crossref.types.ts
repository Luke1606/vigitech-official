/**
 * @file Defines the types for the raw data collected from the CrossRef API.
 * @description This file contains the type definitions for raw CrossRef scholarly article data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 */

/**
 * Represents the type of a technology item from CrossRef.
 * @enum {string}
 */
export type CrossRefItemType = 'article' | 'research-paper';

/**
 * Represents a concise CrossRef Work (e.g., article, conference paper) object.
 * This type is used for raw data collection before further processing, focusing on key information.
 */
export type CrossRefWork = {
    DOI: string;
    title: string[];
    author: Array<{
        given: string;
        family: string;
        sequence: string;
        affiliation: Array<{ name: string }>;
    }>;
    'container-title': string[];
    'short-container-title': string[];
    abstract?: string; // Optional, as not all works have an abstract
    issued: {
        'date-parts': number[][]; // e.g., [[2023, 10, 26]]
    };
    created: {
        'date-parts': number[][];
        timestamp: number;
    };
    deposited: {
        'date-parts': number[][];
        timestamp: number;
    };
    indexed: {
        'date-parts': number[][];
        timestamp: number;
    };
    publisher: string;
    type: string; // e.g., 'journal-article', 'conference-paper'
    URL: string;
    score?: number; // Added for search results
    subject?: string[]; // Keywords/subjects
    // Add other relevant fields as needed, but keep it concise for initial implementation
};
