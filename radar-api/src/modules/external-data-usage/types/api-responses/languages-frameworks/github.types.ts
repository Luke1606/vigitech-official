export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description?: string;
  language?: string;
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  created_at?: string;
  updated_at?: string;
  pushed_at?: string;
  owner?: { login: string };
}

export interface GitHubTrendsResponse {
  total_count: number;
  items: GitHubRepo[];
}
