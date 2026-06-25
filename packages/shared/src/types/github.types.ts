export interface GitHubRepo {
  repoId: number;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  isPrivate: boolean;
  url: string;
  updatedAt: Date;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: Date;
  url: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  author: string;
  createdAt: Date;
  url: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: string[];
  createdAt: Date;
  url: string;
}

export interface GitHubConnection {
  _id: string;
  user: string;
  githubUserId: number;
  username: string;
  cachedRepos: GitHubRepo[];
  reposCachedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
