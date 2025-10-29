export interface GitLabUser {
    id: number;
    username: string;
    name: string;
    state: 'active' | 'blocked';
    avatar_url: string;
    web_url: string;
    created_at: string;
    bio: string | null;
    location: string | null;
    public_email: string | null;
    skype: string;
    linkedin_url: string;
    twitter_url: string;
    website_url: string;
    organization: string | null;
    last_activity_on: string;
    current_sign_in_at: string;
    last_sign_in_at: string;
    confirmed_at: string;
    theme_id: number;
    color_scheme_id: number;
    projects_limit: number;
    current_sign_in_ip: string;
    last_sign_in_ip: string;
    can_create_group: boolean;
    can_create_project: boolean;
    two_factor_enabled: boolean;
    external: boolean;
    private_profile: boolean;
    shared_runners_minutes_limit: number;
    extra_shared_runners_minutes_limit: number;
    is_admin: boolean;
    note: string | null;
}

export interface GitLabProject {
    id: number;
    description: string | null;
    name: string;
    name_with_namespace: string;
    path: string;
    path_with_namespace: string;
    created_at: string;
    default_branch: string;
    tag_list: string[];
    topics: string[];
    ssh_url_to_repo: string;
    http_url_to_repo: string;
    web_url: string;
    readme_url: string | null;
    avatar_url: string | null;
    forks_count: number;
    star_count: number;
    last_activity_at: string;
    namespace: {
        id: number;
        name: string;
        path: string;
        kind: string;
        full_path: string;
        parent_id: number | null;
        avatar_url: string | null;
        web_url: string;
    };
    container_registry_enabled: boolean;
    issues_enabled: boolean;
    merge_requests_enabled: boolean;
    wiki_enabled: boolean;
    jobs_enabled: boolean;
    snippets_enabled: boolean;
    can_create_merge_request_in: boolean;
    resolve_outdated_diff_discussions: boolean;
    container_expiration_policy: {
        cadence: string;
        enabled: boolean;
        keep_n: number;
        older_than: string;
        name_regex: string | null;
        next_run_at: string;
    };
    visibility: 'private' | 'internal' | 'public';
    owner: GitLabUser;
    // ... many other fields
}

export interface GitLabCommit {
    id: string;
    short_id: string;
    created_at: string;
    parent_ids: string[];
    title: string;
    message: string;
    author_name: string;
    author_email: string;
    authored_date: string;
    committer_name: string;
    committer_email: string;
    committed_date: string;
    web_url: string;
    stats?: {
        additions: number;
        deletions: number;
        total: number;
    };
    status?: string; // e.g., 'success', 'failed'
}

export interface GitLabMergeRequest {
    id: number;
    iid: number;
    project_id: number;
    title: string;
    description: string | null;
    state: 'opened' | 'closed' | 'merged';
    created_at: string;
    updated_at: string;
    merged_by: GitLabUser | null;
    merged_at: string | null;
    closed_by: GitLabUser | null;
    closed_at: string | null;
    target_branch: string;
    source_branch: string;
    upvotes: number;
    downvotes: number;
    author: GitLabUser;
    assignee: GitLabUser | null;
    assignees: GitLabUser[];
    reviewers: GitLabUser[];
    web_url: string;
    // ... many other fields
}

export interface GitLabApiResponse {
    projects?: GitLabProject[];
    users?: GitLabUser[];
    commits?: GitLabCommit[];
    mergeRequests?: GitLabMergeRequest[];
    // Add other potential API responses as needed
}
