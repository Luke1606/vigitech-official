/**
 * @file Defines the types for the raw data collected from the Docker Hub API.
 * @description This file contains the type definitions for raw Docker Hub repository data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 */

/**
 * Represents the type of a technology item from Docker Hub.
 * @enum {string}
 */
export type DockerHubItemType = 'repository' | 'image';

/**
 * Represents a concise Docker Hub Repository object.
 * This type is used for raw data collection before further processing, focusing on key information.
 */
export type DockerHubRepository = {
    creator: number;
    id: number;
    image_id: string | null;
    last_updated: string; // ISO 8601 format
    name: string;
    namespace: string;
    repository_type: string; // e.g., 'image'
    star_count: number;
    status: string; // e.g., 'Active'
    summary: string;
    full_description: string | null;
    pull_count: number;
    // Add other relevant fields as needed, but keep it concise for initial implementation
};
