export interface DockerHubUser {
    id: string;
    username: string;
    full_name?: string;
    location?: string;
    company?: string;
    date_joined?: string;
    gravatar_url?: string;
    profile_url?: string;
}

export interface DockerHubRepo {
    creator?: number; // User ID of the creator
    full_description?: string;
    affiliation?: string;
    image_id?: string;
    repository_type?: 'image' | 'container';
    has_starred?: boolean;
    status?: number;
    description?: string;
    is_private?: boolean;
    is_automated?: boolean;
    can_edit?: boolean;
    detail?: string;
    star_count?: number;
    pull_count?: number;
    last_updated?: string;
    date_registered?: string;
    collaborator_count?: number;
    namespace?: string;
    name?: string;
    owner?: string;
    user?: string; // Username of the owner
    url?: string;
    enable_private_scans?: boolean;
    scm_repo?: string;
    scm_data?: Record<string, unknown>; // Generic object for SCM data
    last_updater?: number; // User ID of the last updater
    last_updater_username?: string;
    has_scans?: boolean;
    is_org_only?: boolean;
    name_tag?: string;
    // Potentially other fields like tags, build history, etc.
}

export interface DockerHubTag {
    creator?: number;
    id?: number;
    image_id?: string;
    last_updated?: string;
    last_updater?: number;
    last_updater_username?: string;
    name: string;
    repository?: number;
    full_size?: number;
    v2?: boolean;
    tag_last_pushed?: string;
    tag_last_pulled?: string;
    // Potentially other fields like digest, images array
}

export interface DockerHubApiResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
