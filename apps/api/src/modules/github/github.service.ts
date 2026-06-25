import { GitHubConnection, type IGitHubConnection } from './github-connection.model.js';
import { AppError } from '../../utils/app-error.js';
import { logger } from '../../utils/logger.js';

const GITHUB_API = 'https://api.github.com';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function githubFetch(path: string, token: string) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'DevFlow',
    },
  });

  if (!res.ok) {
    logger.error('GitHub API error', { path, status: res.status });
    throw AppError.badRequest(`GitHub API error: ${res.status}`);
  }

  return res.json();
}

export async function connectGitHub(
  userId: string,
  accessToken: string,
): Promise<IGitHubConnection> {
  const userData = await githubFetch('/user', accessToken) as {
    id: number; login: string;
  };

  const existing = await GitHubConnection.findOne({ user: userId });

  if (existing) {
    existing.githubUserId = userData.id;
    existing.username = userData.login;
    existing.accessToken = accessToken;
    await existing.save();
    return existing;
  }

  return GitHubConnection.create({
    user: userId,
    githubUserId: userData.id,
    username: userData.login,
    accessToken,
  });
}

export async function disconnectGitHub(userId: string): Promise<void> {
  const result = await GitHubConnection.findOneAndDelete({ user: userId });
  if (!result) throw AppError.notFound('GitHub not connected');
}

export async function getConnection(userId: string): Promise<IGitHubConnection | null> {
  return GitHubConnection.findOne({ user: userId });
}

export async function getRepos(userId: string): Promise<IGitHubConnection['cachedRepos']> {
  const conn = await GitHubConnection.findOne({ user: userId });
  if (!conn) throw AppError.notFound('GitHub not connected');

  const cacheExpired = !conn.reposCachedAt ||
    Date.now() - conn.reposCachedAt.getTime() > CACHE_TTL;

  if (cacheExpired) {
    try {
      const repos = await githubFetch('/user/repos?sort=updated&per_page=100', conn.accessToken) as Array<{
        id: number; name: string; full_name: string; description: string | null;
        language: string | null; stargazers_count: number; forks_count: number;
        private: boolean; html_url: string; updated_at: string;
      }>;

      conn.cachedRepos = repos.map((r) => ({
        repoId: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description ?? '',
        language: r.language ?? '',
        stars: r.stargazers_count,
        forks: r.forks_count,
        isPrivate: r.private,
        url: r.html_url,
        updatedAt: new Date(r.updated_at),
      }));
      conn.reposCachedAt = new Date();
      await conn.save();
    } catch (err) {
      if (conn.cachedRepos.length > 0) {
        logger.warn('GitHub API fetch failed, using cached data', { error: err });
        return conn.cachedRepos;
      }
      throw err;
    }
  }

  return conn.cachedRepos;
}

export async function getRepoCommits(
  userId: string,
  owner: string,
  repo: string,
) {
  const conn = await GitHubConnection.findOne({ user: userId });
  if (!conn) throw AppError.notFound('GitHub not connected');

  const commits = await githubFetch(
    `/repos/${owner}/${repo}/commits?per_page=20`,
    conn.accessToken,
  ) as Array<{
    sha: string;
    commit: { message: string; author: { name: string; date: string } };
    html_url: string;
  }>;

  return commits.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0],
    author: c.commit.author.name,
    date: c.commit.author.date,
    url: c.html_url,
  }));
}

export async function getRepoPulls(
  userId: string,
  owner: string,
  repo: string,
) {
  const conn = await GitHubConnection.findOne({ user: userId });
  if (!conn) throw AppError.notFound('GitHub not connected');

  const pulls = await githubFetch(
    `/repos/${owner}/${repo}/pulls?state=all&per_page=20`,
    conn.accessToken,
  ) as Array<{
    number: number; title: string; state: string; merged_at: string | null;
    user: { login: string }; created_at: string; html_url: string;
  }>;

  return pulls.map((p) => ({
    number: p.number,
    title: p.title,
    state: p.merged_at ? 'merged' : p.state,
    author: p.user.login,
    createdAt: p.created_at,
    url: p.html_url,
  }));
}

export async function getRepoIssues(
  userId: string,
  owner: string,
  repo: string,
) {
  const conn = await GitHubConnection.findOne({ user: userId });
  if (!conn) throw AppError.notFound('GitHub not connected');

  const issues = await githubFetch(
    `/repos/${owner}/${repo}/issues?state=all&per_page=20`,
    conn.accessToken,
  ) as Array<{
    number: number; title: string; state: string;
    labels: Array<{ name: string }>; created_at: string; html_url: string;
    pull_request?: unknown;
  }>;

  return issues
    .filter((i) => !i.pull_request)
    .map((i) => ({
      number: i.number,
      title: i.title,
      state: i.state,
      labels: i.labels.map((l) => l.name),
      createdAt: i.created_at,
      url: i.html_url,
    }));
}

export async function getActivity(userId: string) {
  const conn = await GitHubConnection.findOne({ user: userId });
  if (!conn) throw AppError.notFound('GitHub not connected');

  const events = await githubFetch(
    `/users/${conn.username}/events?per_page=20`,
    conn.accessToken,
  ) as Array<{
    type: string;
    repo: { name: string };
    created_at: string;
    payload: { commits?: Array<{ message: string }>; action?: string; pull_request?: { title: string } };
  }>;

  return events.slice(0, 15).map((e) => ({
    type: e.type,
    repo: e.repo.name,
    date: e.created_at,
    summary: formatEventSummary(e),
  }));
}

function formatEventSummary(event: {
  type: string;
  payload: { commits?: Array<{ message: string }>; action?: string; pull_request?: { title: string } };
}): string {
  switch (event.type) {
    case 'PushEvent':
      return `Pushed ${event.payload.commits?.length ?? 0} commit(s)`;
    case 'PullRequestEvent':
      return `${event.payload.action ?? ''} PR: ${event.payload.pull_request?.title ?? ''}`;
    case 'IssuesEvent':
      return `${event.payload.action ?? ''} issue`;
    case 'CreateEvent':
      return 'Created branch or tag';
    case 'WatchEvent':
      return 'Starred repository';
    case 'ForkEvent':
      return 'Forked repository';
    default:
      return event.type.replace('Event', '');
  }
}
