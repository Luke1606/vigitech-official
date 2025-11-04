/**
 * @file Defines the types for the raw notebook data collected from the Kaggle API.
 * @description This file contains the type definitions for raw Kaggle notebook data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 */

/**
 * Represents a Kaggle notebook (also known as a Kernel).
 * Official API documentation: https://www.kaggle.com/docs/api (refer to kernel-related endpoints)
 */
export type KaggleNotebook = {
    id: number;
    ref: string; // e.g., "user/notebook-name"
    title: string;
    url: string;
    date: string; // ISO 8601 format
    ownerName: string;
    ownerRef: string;
    language: string;
    kernelType: string; // e.g., "notebook"
    forkCount: number;
    voteCount: number;
    lastRunTime: string; // ISO 8601 format
    isPrivate: boolean;
    // This is a simplified type; actual Kaggle API responses for notebooks can be more detailed.
    // For example, it might include `description`, `datasetRefs`, `competitionRefs`, `modelRefs`, etc.
};
