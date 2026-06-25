import { useState } from 'react';
import { useGitHubStatus, useGitHubRepos, useConnectGitHub, useDisconnectGitHub, useGitHubCommits, useGitHubPulls, useGitHubIssues } from '../hooks/use-github';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { GitBranch, Star, GitFork, Lock, Globe, ArrowLeft, GitCommit, GitPullRequest, CircleDot, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { GitHubRepo } from '@devflow/shared';

export function GitHubPage() {
  const { data: status, isLoading: statusLoading } = useGitHubStatus();
  const isConnected = !!status?.connected;
  const { data: repos, isLoading: reposLoading, error: reposError } = useGitHubRepos(isConnected);
  const connectGitHub = useConnectGitHub();
  const disconnectGitHub = useDisconnectGitHub();

  const [connectOpen, setConnectOpen] = useState(false);
  const [token, setToken] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    connectGitHub.mutate(token.trim(), {
      onSuccess: () => { setConnectOpen(false); setToken(''); },
    });
  };

  if (statusLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">GitHub</h1>
        <div className="mt-6 h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">GitHub</h1>
        <div className="mt-12 flex flex-col items-center rounded-lg border border-dashed border-border p-12">
          <GitBranch className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Connect your GitHub account</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            View repositories, commits, pull requests, and issues.
          </p>
          {connectGitHub.isError && (
            <div className="mt-4 w-full max-w-md">
              <ErrorAlert message="Failed to connect. Please check your token and try again." />
            </div>
          )}
          <Button className="mt-4" onClick={() => setConnectOpen(true)}>
            Connect GitHub
          </Button>

          <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect GitHub</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gh-token">Personal Access Token</Label>
                  <Input
                    id="gh-token"
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_..."
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Create a token at GitHub Settings &gt; Developer Settings &gt; Personal Access Tokens with repo scope.
                  </p>
                </div>
                {connectGitHub.isError && (
                  <ErrorAlert message="Invalid token or GitHub is unavailable. Please try again." />
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setConnectOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={!token.trim() || connectGitHub.isPending}>
                    {connectGitHub.isPending ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  if (selectedRepo) {
    const [owner, repo] = selectedRepo.fullName.split('/');
    return <RepoDetail owner={owner!} repo={repo!} repoData={selectedRepo} onBack={() => setSelectedRepo(null)} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GitHub</h1>
          <p className="text-sm text-muted-foreground">Connected as @{status?.username}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => disconnectGitHub.mutate()}>
          Disconnect
        </Button>
      </div>

      {reposError && (
        <div className="mt-4">
          <ErrorAlert message="Failed to load repositories. Your token may have expired." />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reposLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg border border-border bg-muted/50" />
          ))
        ) : !repos?.length ? (
          <div className="col-span-full rounded-lg border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No repositories found.</p>
          </div>
        ) : (
          repos.map((repo) => (
            <Card
              key={repo.repoId}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setSelectedRepo(repo)}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setSelectedRepo(repo); }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {repo.isPrivate ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Globe className="h-4 w-4 text-muted-foreground" />}
                  <CardTitle className="truncate text-sm">{repo.name}</CardTitle>
                </div>
                {repo.description && (
                  <CardDescription className="line-clamp-2 text-xs">{repo.description}</CardDescription>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  {repo.language && <Badge variant="secondary" className="text-[10px]">{repo.language}</Badge>}
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stars}</span>
                  <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{repo.forks}</span>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function RepoDetail({ owner, repo, repoData, onBack }: {
  owner: string; repo: string; repoData: GitHubRepo; onBack: () => void;
}) {
  const { data: commits, isLoading: commitsLoading, error: commitsError } = useGitHubCommits(owner, repo);
  const { data: pulls, isLoading: pullsLoading, error: pullsError } = useGitHubPulls(owner, repo);
  const { data: issues, isLoading: issuesLoading, error: issuesError } = useGitHubIssues(owner, repo);

  const renderLoading = () => (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-md border border-border bg-muted/50" />
      ))}
    </div>
  );

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Back to repos
      </Button>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{repoData.fullName}</h1>
        <Badge variant={repoData.isPrivate ? 'secondary' : 'outline'}>
          {repoData.isPrivate ? 'Private' : 'Public'}
        </Badge>
      </div>
      {repoData.description && <p className="mt-1 text-sm text-muted-foreground">{repoData.description}</p>}

      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
        {repoData.language && <span>{repoData.language}</span>}
        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{repoData.stars}</span>
        <span className="flex items-center gap-1"><GitFork className="h-3.5 w-3.5" />{repoData.forks}</span>
      </div>

      <Separator className="my-4" />

      <Tabs defaultValue="commits">
        <TabsList>
          <TabsTrigger value="commits" className="gap-1.5"><GitCommit className="h-3.5 w-3.5" />Commits</TabsTrigger>
          <TabsTrigger value="pulls" className="gap-1.5"><GitPullRequest className="h-3.5 w-3.5" />Pull Requests</TabsTrigger>
          <TabsTrigger value="issues" className="gap-1.5"><CircleDot className="h-3.5 w-3.5" />Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="commits" className="mt-4 space-y-2">
          {commitsError ? (
            <ErrorAlert message="Failed to load commits." />
          ) : commitsLoading ? renderLoading() : !commits?.length ? (
            <p className="text-sm text-muted-foreground">No commits found.</p>
          ) : commits.map((c) => (
            <div key={c.sha} className="flex items-start gap-3 rounded-md border border-border p-3">
              <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{c.sha}</code>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{c.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.author} &middot; {format(new Date(c.date), 'MMM d, yyyy')}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="pulls" className="mt-4 space-y-2">
          {pullsError ? (
            <ErrorAlert message="Failed to load pull requests." />
          ) : pullsLoading ? renderLoading() : !pulls?.length ? (
            <p className="text-sm text-muted-foreground">No pull requests found.</p>
          ) : pulls.map((p) => (
            <div key={p.number} className="flex items-center gap-3 rounded-md border border-border p-3">
              <GitPullRequest className={`h-4 w-4 shrink-0 ${p.state === 'merged' ? 'text-violet-500' : p.state === 'open' ? 'text-green-500' : 'text-red-500'}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">#{p.number} {p.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.author} &middot; {format(new Date(p.createdAt), 'MMM d, yyyy')}</p>
              </div>
              <Badge variant="secondary" className="text-[10px] capitalize">{p.state}</Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="issues" className="mt-4 space-y-2">
          {issuesError ? (
            <ErrorAlert message="Failed to load issues." />
          ) : issuesLoading ? renderLoading() : !issues?.length ? (
            <p className="text-sm text-muted-foreground">No issues found.</p>
          ) : issues.map((i) => (
            <div key={i.number} className="flex items-center gap-3 rounded-md border border-border p-3">
              <CircleDot className={`h-4 w-4 shrink-0 ${i.state === 'open' ? 'text-green-500' : 'text-muted-foreground'}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">#{i.number} {i.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{format(new Date(i.createdAt), 'MMM d, yyyy')}</p>
              </div>
              <Badge variant="secondary" className="text-[10px] capitalize">{i.state}</Badge>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
