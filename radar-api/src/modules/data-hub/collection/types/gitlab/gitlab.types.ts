/**
 * @file Defines the types for the raw data collected from the GitLab API.
 * @description This file contains the type definitions for the raw GitLab project data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 */

/**
 * Represents the type of a technology item from GitLab.
 * @enum {string}
 */
export type GitLabItemType = 'project';

/**
 * Represents a concise GitLab project object as returned by the GitLab API.
 * This type is used for raw data collection before further processing, focusing on key information.
 */
export type GitLabProject = {
    id: number;
    name: string;
    name_with_namespace: string;
    path: string;
    path_with_namespace: string;
    description: string | null;
    web_url: string;
    avatar_url: string | null;
    forks_count: number;
    star_count: number;
    last_activity_at: string;
    created_at: string;
    topics: string[];
    visibility: 'public' | 'internal' | 'private';
    owner: {
        id: number;
        name: string;
        username: string;
        web_url: string;
    };
};
