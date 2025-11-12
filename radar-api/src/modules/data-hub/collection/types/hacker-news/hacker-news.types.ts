/**
 * @file Defines the types for the raw data collected from the Hacker News API.
 * @description This file contains the type definitions for raw Hacker News item data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 */

/**
 * Represents a Hacker News item (story, comment, job, poll, or pollopt).
 * Official API documentation: https://github.com/HackerNews/API
 */
export type HackerNewsItem = {
    id: number;
    deleted?: boolean;
    type: 'job' | 'story' | 'comment' | 'poll' | 'pollopt';
    by?: string; // The username of the item's author.
    time?: number; // Creation date of the item, in Unix Time.
    text?: string; // The comment, story or poll text. HTML.
    dead?: boolean;
    parent?: number; // The comment's parent: either another comment or the relevant story.
    poll?: number; // The pollopt's associated poll.
    kids?: number[]; // The IDs of the item's comments, in ranked display order.
    url?: string; // The URL of the story.
    score?: number; // The story's score, or the votes for a pollopt.
    title?: string; // The story's title.
    parts?: number[]; // A list of related pollopts, in display order.
    descendants?: number; // In the case of stories or polls, the total comment count.
};

/**
 * Represents a Hacker News user profile.
 * Official API documentation: https://github.com/HackerNews/API
 */
export type HackerNewsUser = {
    id: string; // The user's unique username.
    delay?: number; // Delay in minutes between a user's comments from when they're notified.
    created: number; // Creation date of the user profile, in Unix Time.
    karma: number; // The user's karma.
    about?: string; // Optional: The user's optional self-description. HTML.
    submitted?: number[]; // List of the user's stories, polls and comments.
};
