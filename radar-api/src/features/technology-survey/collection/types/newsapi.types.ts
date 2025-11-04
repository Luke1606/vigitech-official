/**
 * @file Defines the types for the raw data collected from the NewsAPI.
 * @description This file contains the type definitions for the raw NewsAPI article data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 */

/**
 * Represents a NewsAPI source object.
 */
export type NewsApiSource = {
    id: string | null;
    name: string;
};

/**
 * Represents a NewsAPI article object.
 */
export type NewsApiArticle = {
    source: NewsApiSource;
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
};

/**
 * Represents the full response structure from the NewsAPI 'everything' endpoint.
 */
export type NewsApiResponse = {
    status: 'ok' | 'error';
    totalResults: number;
    articles: NewsApiArticle[];
};
