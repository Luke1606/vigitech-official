export interface GitHubUser {
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
}

export interface GitHubRepo {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: GitHubUser;
    html_url: string;
    description: string | null;
    fork: boolean;
    url: string;
    forks_url: string;
    keys_url: string;
    collaborators_url: string;
    teams_url: string;
    hooks_url: string;
    issue_events_url: string;
    events_url: string;
    assignees_url: string;
    branches_url: string;
    tags_url: string;
    blobs_url: string;
    git_tags_url: string;
    git_refs_url: string;
    trees_url: string;
    statuses_url: string;
    languages_url: string;
    stargazers_url: string;
    contributors_url: string;
    subscribers_url: string;
    subscription_url: string;
    commits_url: string;
    git_commits_url: string;
    comments_url: string;
    issue_comment_url: string;
    contents_url: string;
    compare_url: string;
    merges_url: string;
    archive_url: string;
    downloads_url: string;
    issues_url: string;
    pulls_url: string;
    milestones_url: string;
    notifications_url: string;
    labels_url: string;
    releases_url: string;
    deployments_url: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    git_url: string;
    ssh_url: string;
    clone_url: string;
    svn_url: string;
    homepage: string | null;
    size: number;
    stargazers_count: number;
    watchers_count: number;
    language: string | null;
    has_issues: boolean;
    has_projects: boolean;
    has_downloads: boolean;
    has_wiki: boolean;
    has_pages: boolean;
    has_discussions: boolean;
    forks_count: number;
    mirror_url: string | null;
    archived: boolean;
    disabled: boolean;
    open_issues_count: number;
    license: {
        key: string;
        name: string;
        spdx_id: string;
        url: string;
        node_id: string;
    } | null;
    allow_forking: boolean;
    is_template: boolean;
    web_commit_signoff_required: boolean;
    topics: string[];
    visibility: string;
    forks: number;
    open_issues: number;
    watchers: number;
    default_branch: string;
    temp_clone_token: string | null;
    network_count: number;
    subscribers_count: number;
}

export interface GitHubCommit {
    sha: string;
    node_id: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
        tree: {
            sha: string;
            url: string;
        };
        url: string;
        comment_count: number;
        verification?: {
            verified: boolean;
            reason: string;
            signature: string | null;
            payload: string | null;
        };
    };
    url: string;
    html_url: string;
    comments_url: string;
    author: GitHubUser | null;
    committer: GitHubUser | null;
    parents: {
        sha: string;
        url: string;
        html_url: string;
    }[];
}

export interface GitHubPullRequest {
    id: number;
    node_id: string;
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
    issue_url: string;
    commits_url: string;
    review_comments_url: string;
    review_comment_url: string;
    comments_url: string;
    statuses_url: string;
    number: number;
    state: 'open' | 'closed';
    locked: boolean;
    title: string;
    user: GitHubUser;
    body: string | null;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    merged_at: string | null;
    merge_commit_sha: string | null;
    assignee: GitHubUser | null;
    assignees: GitHubUser[];
    requested_reviewers: GitHubUser[];
    requested_teams: unknown[];
    labels: unknown[];
    milestone: unknown;
    draft: boolean;
    head: {
        label: string;
        ref: string;
        sha: string;
        user: GitHubUser;
        repo: GitHubRepo;
    };
    base: {
        label: string;
        ref: string;
        sha: string;
        user: GitHubUser;
        repo: GitHubRepo;
    };
    _links: {
        self: { href: string };
        html: { href: string };
        issue: { href: string };
        comments: { href: string };
        review_comments: { href: string };
        review_comment: { href: string };
        commits: { href: string };
        statuses: { href: string };
    };
    author_association: string;
    auto_merge: unknown;
    active_lock_reason: string | null;
    merged: boolean;
    mergeable: boolean | null;
    rebaseable: boolean | null;
    mergeable_state: string;
    merged_by: GitHubUser | null;
    comments: number;
    review_comments: number;
    maintainer_can_modify: boolean;
    commits: number;
    additions: number;
    deletions: number;
    changed_files: number;
}

export interface GitHubSearchCodeResult {
    total_count: number;
    incomplete_results: boolean;
    items: {
        name: string;
        path: string;
        sha: string;
        url: string;
        git_url: string;
        html_url: string;
        repository: GitHubRepo;
        score: number;
    }[];
}

export interface GitHubApiResponse {
    repositories?: GitHubRepo[];
    users?: GitHubUser[];
    commits?: GitHubCommit[];
    pullRequests?: GitHubPullRequest[];
    searchCode?: GitHubSearchCodeResult;
    // Add other potential API responses as needed
}
