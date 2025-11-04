/**
 * @file Defines the types for the raw data collected from GitHub's Octoverse reports.
 * @description This file contains the type definitions for raw Octoverse report data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 *              Note: Octoverse data is typically presented in reports (PDFs, web pages) rather than a direct API.
 *              These types represent the structured data extracted from such reports.
 */

/**
 * Represents a key trend or insight identified in an Octoverse report.
 */
export type OctoverseTrend = {
    id: string; // Unique identifier for the trend
    year: number;
    title: string;
    description: string; // Detailed explanation of the trend
    technologiesMentioned: string[]; // List of technologies relevant to the trend
    dataPoints: Array<{
        // Supporting data points, e.g., growth percentages, usage stats
        metric: string;
        value: number | string;
        unit?: string;
        context?: string;
    }>;
    sourceUrl: string; // URL to the specific section of the Octoverse report
    category: string; // e.g., "Programming Languages", "Cloud Adoption", "AI/ML"
};

/**
 * Represents a summary of an Octoverse report.
 */
export type OctoverseReportSummary = {
    reportYear: number;
    reportTitle: string;
    reportUrl: string;
    keyFindings: string[];
    overallThemes: string[];
    // Potentially other aggregated metrics or high-level summaries
};

// Depending on the extraction method (e.g., parsing structured data, LLM extraction from text),
// these types might need to be adjusted.
