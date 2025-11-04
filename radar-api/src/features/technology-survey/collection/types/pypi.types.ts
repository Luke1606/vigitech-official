/**
 * @file Defines the types for the raw data collected from the PyPI (Python Package Index) API.
 * @description This file contains the type definitions for raw PyPI package data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 */

/**
 * Represents a package metadata object from the PyPI JSON API.
 * Official API documentation: https://warehouse.pypa.io/api-reference/json.html
 * (Specifically, the `/pypi/<package_name>/json` endpoint)
 */
export type PypiPackageMetadata = {
    info: {
        name: string;
        version: string;
        summary: string;
        description: string; // Markdown content
        description_content_type: string; // e.g., "text/markdown"
        author: string;
        author_email: string;
        maintainer: string | null;
        maintainer_email: string | null;
        license: string;
        home_page: string | null;
        project_url: string;
        project_urls: { [key: string]: string }; // e.g., "Homepage", "Source", "Tracker"
        bugtrack_url: string | null;
        docs_url: string | null;
        package_url: string;
        platform: string | null;
        keywords: string; // Comma-separated string
        classifiers: string[];
        requires_dist: string[] | null; // List of dependencies
        requires_python: string | null;
        release_url: string;
        yanked: boolean;
        yanked_reason: string | null;
    };
    last_serial: number;
    releases: {
        [version: string]: PypiRelease[];
    };
    urls: PypiRelease[]; // URLs for the latest release files
    vulnerabilities: PypiVulnerability[];
};

/**
 * Represents a specific release file (e.g., wheel, sdist) for a PyPI package.
 */
export type PypiRelease = {
    comment_text: string;
    digests: {
        md5: string;
        sha256: string;
    };
    downloads: number;
    filename: string;
    has_sig: boolean;
    md5_digest: string;
    packagetype: 'sdist' | 'bdist_wheel' | 'bdist_egg' | 'bdist_dmg' | 'bdist_rpm' | 'bdist_wininst';
    python_version: string;
    requires_python: string | null;
    size: number;
    upload_time: string; // ISO 8601 date
    upload_time_iso_8601: string; // ISO 8601 date
    url: string;
    yanked: boolean;
    yanked_reason: string | null;
};

/**
 * Represents a reported vulnerability for a PyPI package.
 */
export type PypiVulnerability = {
    id: string;
    source: string; // e.g., "osv.dev"
    details: string;
    withdrawn: string | null; // ISO 8601 date if withdrawn
    aliases: string[];
    events: Array<{
        type: string; // e.g., "fixed", "introduced"
        specifier: string; // e.g., "<=1.0.0"
    }>;
    // More fields might be present depending on the vulnerability source
};

/**
 * Represents the response structure for PyPI search results (via XML-RPC or alternative search APIs).
 * Note: The official JSON API does not have a direct search endpoint. This type is illustrative.
 */
export type PypiSearchPackage = {
    name: string;
    version: string;
    summary: string;
};
