/**
 * @file Defines the types for the raw data collected from the npm Registry API.
 * @description This file contains the type definitions for raw npm package data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 */

/**
 * Represents a package object from the npm Registry API.
 * Official API documentation: https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md
 * (Specifically, the `/package/:package` endpoint and search results)
 */
export type NpmPackage = {
    _id: string; // Full package name, e.g., "react"
    _rev?: string;
    name: string;
    'dist-tags': {
        latest: string;
        [key: string]: string; // Other dist-tags like 'next', 'beta'
    };
    versions: {
        [version: string]: NpmPackageVersion;
    };
    time: {
        created: string; // ISO 8601 date
        modified: string; // ISO 8601 date
        [version: string]: string; // Publish dates for each version
    };
    maintainers: Array<{
        name: string;
        email: string;
    }>;
    description?: string;
    homepage?: string;
    keywords?: string[];
    repository?: {
        type: string;
        url: string;
    };
    bugs?: {
        url: string;
    };
    license?: string;
    readme?: string;
    // Additional fields from search results or full package metadata
    author?: {
        name: string;
        email?: string;
        url?: string;
    };
    // For search results, there might be a 'score' object
    score?: {
        final: number;
        detail: {
            quality: number;
            popularity: number;
            maintenance: number;
        };
    };
    // For search results, there might be 'search_score'
    search_score?: number;
};

/**
 * Represents a specific version of an npm package.
 */
export type NpmPackageVersion = {
    name: string;
    version: string;
    description?: string;
    main?: string;
    module?: string;
    types?: string;
    typings?: string;
    scripts?: { [key: string]: string };
    dependencies?: { [key: string]: string };
    devDependencies?: { [key: string]: string };
    peerDependencies?: { [key: string]: string };
    optionalDependencies?: { [key: string]: string };
    bundleDependencies?: string[];
    gitHead?: string;
    bugs?: {
        url: string;
    };
    homepage?: string;
    license?: string;
    repository?: {
        type: string;
        url: string;
    };
    author?: {
        name: string;
        email?: string;
        url?: string;
    };
    maintainers?: Array<{
        name: string;
        email: string;
    }>;
    _id: string;
    _nodeVersion?: string;
    _npmVersion?: string;
    dist: {
        shasum: string;
        tarball: string;
        integrity?: string;
        fileCount?: number;
        unpackedSize?: number;
        'npm-signature'?: string;
    };
    _npmUser?: {
        name: string;
        email: string;
    };
    directories?: object;
    _has?: boolean; // Indicates if the package has a specific feature, e.g., "hasInstallScript"
};

/**
 * Represents the response structure for npm search results.
 */
export type NpmSearchResponse = {
    objects: Array<{
        package: NpmPackage;
        score: {
            final: number;
            detail: {
                quality: number;
                popularity: number;
                maintenance: number;
            };
        };
        search_score: number;
        flags?: {
            unstable?: boolean;
        };
    }>;
    total: number;
    time: string;
};
