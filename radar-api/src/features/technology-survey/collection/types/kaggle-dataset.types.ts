/**
 * @file Defines the types for the raw dataset data collected from the Kaggle API.
 * @description This file contains the type definitions for raw Kaggle dataset data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 */

/**
 * Represents a Kaggle dataset.
 * Official API documentation: https://www.kaggle.com/docs/api (refer to dataset-related endpoints)
 */
export type KaggleDataset = {
    id: number;
    ref: string; // e.g., "user/dataset-name"
    title: string;
    subtitle: string;
    url: string;
    date: string; // ISO 8601 format
    ownerName: string;
    ownerRef: string;
    totalBytes: number;
    usabilityRating: number; // 0-1 scale
    tags: string[];
    licenseName: string;
    // Additional fields often found in dataset listings or details
    files?: Array<{
        name: string;
        size: number;
        type: string;
    }>;
    versions?: Array<{
        versionId: number;
        versionNumber: number;
        creationDate: string;
        creatorName: string;
        creatorRef: string;
    }>;
    // This is a simplified type; actual Kaggle API responses for datasets can be much more detailed.
    // For example, it might include `description`, `kernelCount`, `voteCount`, `downloadCount`, etc.
};
