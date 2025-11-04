/**
 * @file Defines the types for the raw data collected from the Kaggle API.
 * @description This file contains the type definitions for raw Kaggle dataset and notebook data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 */

/**
 * Represents the type of a technology item from Kaggle.
 * @enum {string}
 */
export type KaggleItemType = 'dataset' | 'notebook';

/**
 * Represents a concise Kaggle Dataset object.
 * This type is used for raw data collection before further processing, focusing on key information.
 */
export type KaggleDataset = {
    id: number;
    ref: string; // e.g., 'owner/dataset-name'
    title: string;
    subtitle: string;
    url: string;
    description: string;
    tags: string[];
    ownerName: string;
    ownerRef: string;
    lastUpdated: string; // ISO 8601 format
    downloadCount: number;
    licenseName: string;
    // Add other relevant fields as needed, but keep it concise for initial implementation
};

/**
 * Represents a concise Kaggle Notebook (Code) object.
 * This type is used for raw data collection before further processing, focusing on key information.
 */
export type KaggleNotebook = {
    id: number;
    ref: string; // e.g., 'owner/notebook-name'
    title: string;
    url: string;
    language: string;
    kernelType: string; // e.g., 'notebook'
    forkCount: number;
    voteCount: number;
    lastRunTime: string; // ISO 8601 format
    isPrivate: boolean;
    // Add other relevant fields as needed, but keep it concise for initial implementation
};
