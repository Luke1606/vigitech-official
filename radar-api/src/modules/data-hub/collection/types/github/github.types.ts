/**
 * @file Defines the types for the raw data collected from the GitHub API.
 * @description This file contains the type definitions for the raw GitHub data
 * (Repository, Issue, PR, Code, Topic), ensuring type safety and clarity.
 */

// --- Tipos Base ---

/**
 * Represents the type of a technology item from GitHub.
 * This is used to map the item back to its origin.
 * @enum {string}
 */
export type GitHubItemType = 'repository' | 'issue' | 'pull_request' | 'code' | 'topic';

export type GitHubRepository = {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
    };
    html_url: string;
    description: string | null;
    fork: boolean;
    url: string;
    stargazers_count: number;
    watchers_count: number;
    language: string | null;
    open_issues_count: number;
    topics: string[];
    visibility: string;
    default_branch: string;
    score?: number;
};

/**
 * Representa un Issue o Pull Request de GitHub.
 * Nota: Los resultados de búsqueda de Issues/PRs usan el mismo endpoint /search/issues.
 */
type SharedIssuePrProperties = {
    url: string;
    repository_url: string;
    labels_url: string;
    comments_url: string;
    html_url: string;
    id: number;
    node_id: string;
    number: number;
    title: string;
    user: GitHubRepository['owner'];
    labels: Array<{
        name: string;
        color: string;
    }>;
    state: 'open' | 'closed';
    locked: boolean;
    assignee: GitHubRepository['owner'] | null;
    comments: number;
    created_at: string;
    updated_at: string;
    body: string | null;
    score: number;
    // Propiedad que identifica si es un Pull Request
    pull_request?: {
        url: string;
        html_url: string;
    };
};

/**
 * Representa un Issue de GitHub (excluyendo la propiedad 'pull_request').
 */
export type GitHubIssue = Omit<SharedIssuePrProperties, 'pull_request'>;

/**
 * Representa un Pull Request de GitHub.
 */
export type GitHubPullRequest = SharedIssuePrProperties & {
    pull_request: NonNullable<SharedIssuePrProperties['pull_request']>;
};

/**
 * Representa un fragmento de código encontrado por la búsqueda de código.
 */
export type GitHubCodeResult = {
    name: string;
    path: string;
    sha: string;
    url: string;
    git_url: string;
    html_url: string;
    repository: Pick<GitHubRepository, 'id' | 'name' | 'full_name' | 'owner'>;
    score: number;
};

/**
 * Representa un Topic (Tema) de GitHub.
 */
export type GitHubTopic = {
    name: string;
    display_name: string | null;
    short_description: string | null;
    description: string | null;
    created_by: string | null;
    released: string | null;
    updated_at: string;
    featured: boolean;
    curated: boolean;
};
