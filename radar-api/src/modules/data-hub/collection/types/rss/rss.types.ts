/**
 * @file Defines the types for the raw data collected from RSS feeds.
 * @description This file contains the type definitions for raw RSS feed data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 *              These types are based on common RSS 2.0 and Atom 1.0 elements.
 */

/**
 * Represents an RSS feed item (e.g., an article, blog post).
 * Based on RSS 2.0 specification.
 */
export type RssFeedItem = {
    title: string;
    link: string;
    description: string; // Can contain HTML
    author?: string; // e.g., "editor@example.com"
    category?: string | string[];
    comments?: string; // URL of the comments page
    enclosure?: {
        url: string;
        length: number;
        type: string; // e.g., "audio/mpeg"
    };
    guid?: {
        value: string;
        isPermaLink?: boolean; // default true
    };
    pubDate?: string; // RFC 822 date-time string
    source?: {
        title: string;
        url: string;
    };
    content?: string; // For full content, often from Atom or other extensions
    'dc:creator'?: string; // Dublin Core creator, common in some feeds
};

/**
 * Represents an RSS feed channel (metadata about the feed itself).
 * Based on RSS 2.0 specification.
 */
export type RssFeedChannel = {
    title: string;
    link: string;
    description: string;
    language?: string; // e.g., "en-us"
    copyright?: string;
    managingEditor?: string; // e.g., "webmaster@example.com (Webmaster)"
    webMaster?: string; // e.g., "webmaster@example.com (Webmaster)"
    pubDate?: string; // RFC 822 date-time string
    lastBuildDate?: string; // RFC 822 date-time string
    category?: string | string[];
    generator?: string;
    docs?: string;
    cloud?: {
        domain: string;
        port: number;
        path: string;
        registerProcedure: string;
        protocol: string;
    };
    ttl?: number; // Time to live in minutes
    image?: {
        url: string;
        title: string;
        link: string;
        width?: number; // default 88, max 144
        height?: number; // default 31, max 400
        description?: string;
    };
    textInput?: {
        title: string;
        description: string;
        name: string;
        link: string;
    };
    skipHours?: number[]; // 0-23
    skipDays?: string[]; // Monday, Tuesday, etc.
    items: RssFeedItem[]; // Array of feed items
};

/**
 * Represents a generic RSS feed structure (channel with items).
 */
export type RssFeed = {
    channel: RssFeedChannel;
};

/**
 * Represents an Atom 1.0 feed entry.
 * Official Atom 1.0 specification: https://datatracker.ietf.org/doc/html/rfc4287
 */
export type AtomFeedEntry = {
    id: string;
    title: {
        type?: 'text' | 'html' | 'xhtml';
        value: string;
    };
    updated: string; // ISO 8601 date-time
    author?: {
        name: string;
        uri?: string;
        email?: string;
    };
    link?: Array<{
        href: string;
        rel?: string; // e.g., "alternate", "self", "enclosure"
        type?: string; // e.g., "text/html"
        hreflang?: string;
        title?: string;
        length?: number;
    }>;
    summary?: {
        type?: 'text' | 'html' | 'xhtml';
        value: string;
    };
    content?: {
        type?: 'text' | 'html' | 'xhtml' | 'base64Binary' | 'xml';
        src?: string;
        value: string;
    };
    category?: Array<{
        term: string;
        scheme?: string;
        label?: string;
    }>;
    published?: string; // ISO 8601 date-time
    rights?: {
        type?: 'text' | 'html' | 'xhtml';
        value: string;
    };
    source?: {
        id: string;
        title: {
            type?: 'text' | 'html' | 'xhtml';
            value: string;
        };
        updated: string;
    };
};

/**
 * Represents an Atom 1.0 feed.
 */
export type AtomFeed = {
    id: string;
    title: {
        type?: 'text' | 'html' | 'xhtml';
        value: string;
    };
    updated: string; // ISO 8601 date-time
    author?: {
        name: string;
        uri?: string;
        email?: string;
    };
    link?: Array<{
        href: string;
        rel?: string;
        type?: string;
        hreflang?: string;
        title?: string;
        length?: number;
    }>;
    generator?: {
        uri?: string;
        version?: string;
        value: string;
    };
    rights?: {
        type?: 'text' | 'html' | 'xhtml';
        value: string;
    };
    subtitle?: {
        type?: 'text' | 'html' | 'xhtml';
        value: string;
    };
    entries: AtomFeedEntry[];
};

/**
 * Generic type for a parsed feed, which could be RSS or Atom.
 */
export type ParsedFeed = RssFeed | AtomFeed;
