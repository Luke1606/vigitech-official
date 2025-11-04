/**
 * @file Defines the types for the raw data collected from the Stack Exchange API.
 * @description This file contains the type definitions for raw Stack Exchange data (questions, answers, users),
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 */

/**
 * Represents a Stack Exchange question.
 * Official API documentation: https://api.stackexchange.com/docs/types/question
 */
export type StackExchangeQuestion = {
    question_id: number;
    title: string;
    link: string;
    owner: StackExchangeShallowUser;
    is_answered: boolean;
    view_count: number;
    answer_count: number;
    score: number;
    last_activity_date: number; // Unix timestamp
    creation_date: number; // Unix timestamp
    last_edit_date?: number; // Unix timestamp
    tags: string[];
    body?: string; // Full question body, often not included in summary responses
    accepted_answer_id?: number;
};

/**
 * Represents a Stack Exchange answer.
 * Official API documentation: https://api.stackexchange.com/docs/types/answer
 */
export type StackExchangeAnswer = {
    answer_id: number;
    question_id: number;
    owner: StackExchangeShallowUser;
    is_accepted: boolean;
    score: number;
    last_activity_date: number; // Unix timestamp
    creation_date: number; // Unix timestamp
    last_edit_date?: number; // Unix timestamp
    body?: string; // Full answer body, often not included in summary responses
};

/**
 * Represents a shallow user object from Stack Exchange.
 * Official API documentation: https://api.stackexchange.com/docs/types/shallow-user
 */
export type StackExchangeShallowUser = {
    display_name: string;
    reputation: number;
    user_id: number;
    user_type: 'unregistered' | 'registered' | 'moderator' | 'team_admin' | 'does_not_exist';
    profile_image: string;
    link: string;
    accept_rate?: number;
};

/**
 * Represents the common wrapper for Stack Exchange API responses.
 * Official API documentation: https://api.stackexchange.com/docs/wrapper
 */
export type StackExchangeApiResponse<T> = {
    items: T[];
    has_more: boolean;
    quota_max: number;
    quota_remaining: number;
};
