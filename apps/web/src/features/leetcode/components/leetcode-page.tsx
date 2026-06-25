import { useState } from 'react';
import { useLeetCodeProfile, useConnectLeetCode, useDisconnectLeetCode, useSyncLeetCode } from '../hooks/use-leetcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Flame, RefreshCw, Trophy, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { LeetCodeProfile } from '@devflow/shared';

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

function isProfile(data: unknown): data is LeetCodeProfile {
  return !!data && typeof data === 'object' && '_id' in data;
}

export function LeetCodePage() {
  const { data, isLoading } = useLeetCodeProfile();
  const connectLC = useConnectLeetCode();
  const disconnectLC = useDisconnectLeetCode();
  const syncLC = useSyncLeetCode();

  const [connectOpen, setConnectOpen] = useState(false);
  const [username, setUsername] = useState('');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    connectLC.mutate(username.trim(), {
      onSuccess: () => { setConnectOpen(false); setUsername(''); },
    });
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">LeetCode</h1>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || !isProfile(data)) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">LeetCode</h1>
        <div className="mt-12 flex flex-col items-center rounded-lg border border-dashed border-border p-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Connect your LeetCode account</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your problem-solving progress, streaks, and analytics.
          </p>
          <Button className="mt-4" onClick={() => setConnectOpen(true)}>
            Connect LeetCode
          </Button>

          <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect LeetCode</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lc-username">LeetCode Username</Label>
                  <Input
                    id="lc-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    autoFocus
                  />
                </div>
                {connectLC.isError && (
                  <ErrorAlert message="Username not found or LeetCode is unavailable. Please check and try again." />
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setConnectOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={!username.trim() || connectLC.isPending}>
                    {connectLC.isPending ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  const profile = data;
  const { stats, streaks, recentSubmissions } = profile;
  const solvedPercent = stats.totalQuestions > 0
    ? Math.round((stats.totalSolved / stats.totalQuestions) * 100)
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LeetCode</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => syncLC.mutate()} disabled={syncLC.isPending} className="gap-1.5">
            <RefreshCw className={cn('h-3.5 w-3.5', syncLC.isPending && 'animate-spin')} />
            Sync
          </Button>
          <Button variant="outline" size="sm" onClick={() => disconnectLC.mutate()}>Disconnect</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Solved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSolved}</div>
            <p className="text-xs text-muted-foreground">{solvedPercent}% of {stats.totalQuestions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" /> Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streaks.current} days</div>
            <p className="text-xs text-muted-foreground">Longest: {streaks.longest} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{profile.profile.ranking.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Synced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {profile.lastSyncedAt ? format(new Date(profile.lastSyncedAt), 'MMM d, h:mm a') : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Breakdown */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Easy', solved: stats.easySolved, total: stats.easyTotal, color: 'bg-green-500' },
          { label: 'Medium', solved: stats.mediumSolved, total: stats.mediumTotal, color: 'bg-yellow-500' },
          { label: 'Hard', solved: stats.hardSolved, total: stats.hardTotal, color: 'bg-red-500' },
        ].map((d) => {
          const pct = d.total > 0 ? (d.solved / d.total) * 100 : 0;
          return (
            <Card key={d.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{d.label}</span>
                  <span className="text-sm font-bold">{d.solved}/{d.total}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div className={cn('h-2 rounded-full', d.color)} style={{ width: `${pct}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator className="my-6" />

      {/* Submissions & Contests */}
      <Tabs defaultValue="submissions">
        <TabsList>
          <TabsTrigger value="submissions" className="gap-1.5"><Clock className="h-3.5 w-3.5" />Recent Submissions</TabsTrigger>
          <TabsTrigger value="contests" className="gap-1.5"><Trophy className="h-3.5 w-3.5" />Contests</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-4">
          {!recentSubmissions?.length ? (
            <p className="text-sm text-muted-foreground">No recent submissions.</p>
          ) : (
            <div className="space-y-2">
              {recentSubmissions.map((s, i) => (
                <div key={`${s.titleSlug}-${i}`} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.language} &middot; {format(new Date(s.timestamp), 'MMM d, yyyy')}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{s.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contests" className="mt-4">
          {!profile.contests?.length ? (
            <p className="text-sm text-muted-foreground">No contest data available.</p>
          ) : (
            <div className="space-y-2">
              {profile.contests.map((c, i) => (
                <div key={`${c.title}-${i}`} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(c.date), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">#{c.ranking}</p>
                    <p className="text-xs text-muted-foreground">Score: {c.score}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
