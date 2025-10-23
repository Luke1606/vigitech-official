export interface GitLabProject {
  id: number;
  name: string;
  description?: string;
  web_url?: string;
  star_count?: number;
  forks_count?: number;
  last_activity_at?: string;
  namespace?: { name?: string };
  topics?: string[];
}
