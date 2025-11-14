/**
 * Define los tipos para la respuesta de la API de GitLab.
 */
export type GitLabOwner = {
    id: number;
    username: string;
    name: string;
    web_url: string;
};

export type GitLabProject = {
    id: number;
    description: string | null;
    name: string;
    name_with_namespace: string;
    path: string;
    path_with_namespace: string;
    created_at: string;
    last_activity_at: string;
    star_count: number;
    forks_count: number;
    web_url: string;
    owner: GitLabOwner;
    tag_list: string[];
};
