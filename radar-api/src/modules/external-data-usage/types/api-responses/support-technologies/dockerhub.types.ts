export interface DockerHubRepo {
  name: string;
  namespace: string;
  description?: string;
  pull_count?: number;
  star_count?: number;
  last_updated?: string;
}
