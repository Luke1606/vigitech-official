export interface StackOverflowShallowUser {
    reputation: number;
    user_id: number;
    user_type: 'unregistered' | 'registered' | 'moderator' | 'team_admin';
    profile_image: string;
    display_name: string;
    link: string;
}

export interface StackOverflowTag {
    has_synonyms: boolean;
    is_required: boolean;
    is_moderator_only: boolean;
    count: number;
    name: string;
    last_activity_date?: number;
}

export interface StackOverflowQuestion {
    tags: string[];
    owner?: StackOverflowShallowUser;
    is_answered: boolean;
    view_count: number;
    answer_count: number;
    score: number;
    last_activity_date: number;
    creation_date: number;
    last_edit_date?: number;
    question_id: number;
    content_license?: string;
    link: string;
    title: string;
    body?: string; // Full question body, might be available in specific API calls
}

export interface StackOverflowAnswer {
    owner?: StackOverflowShallowUser;
    is_accepted: boolean;
    score: number;
    last_activity_date: number;
    creation_date: number;
    answer_id: number;
    question_id: number;
    content_license?: string;
    link: string;
    title?: string; // Title of the question this answer belongs to
    body?: string; // Full answer body
}

export interface StackOverflowUser {
    badge_counts: {
        bronze: number;
        silver: number;
        gold: number;
    };
    account_id: number;
    is_employee: boolean;
    last_modified_date: number;
    last_access_date: number;
    reputation_change_year: number;
    reputation_change_quarter: number;
    reputation_change_month: number;
    reputation_change_week: number;
    reputation_change_day: number;
    reputation: number;
    creation_date: number;
    user_type: 'unregistered' | 'registered' | 'moderator' | 'team_admin';
    user_id: number;
    accept_rate?: number;
    location?: string;
    website_url?: string;
    link: string;
    profile_image: string;
    display_name: string;
}

export interface StackOverflowApiResponse<T> {
    items: T[];
    has_more: boolean;
    quota_max: number;
    quota_remaining: number;
}
