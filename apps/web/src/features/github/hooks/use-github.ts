import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { GitHubRepo, GitHubCommit, GitHubPullRequest, GitHubIssue } from '@devflow/shared';

const base = '/integrations/github';

export function useGitHubStatus() {
  return useQuery({
    queryKey: ['github-status'],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/status`);
      return data.data as { connected: boolean; username: string | null };
    },
  });
}

export function useConnectGitHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (accessToken: string) => {
      const { data } = await apiClient.post(`${base}/connect`, { accessToken });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-status'] });
      queryClient.invalidateQueries({ queryKey: ['github-repos'] });
    },
  });
}

export function useDisconnectGitHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`${base}/disconnect`);
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['github-repos'] });
      queryClient.removeQueries({ queryKey: ['github-commits'] });
      queryClient.removeQueries({ queryKey: ['github-pulls'] });
      queryClient.removeQueries({ queryKey: ['github-issues'] });
      queryClient.removeQueries({ queryKey: ['github-activity'] });
      queryClient.invalidateQueries({ queryKey: ['github-status'] });
    },
  });
}

export function useGitHubRepos(enabled: boolean) {
  return useQuery({
    queryKey: ['github-repos'],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/repos`);
      return data.data as GitHubRepo[];
    },
    enabled,
    retry: 1,
  });
}

export function useGitHubCommits(owner: string | null, repo: string | null) {
  return useQuery({
    queryKey: ['github-commits', owner, repo],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/repos/${owner}/${repo}/commits`);
      return data.data as GitHubCommit[];
    },
    enabled: !!owner && !!repo,
    retry: 1,
  });
}

export function useGitHubPulls(owner: string | null, repo: string | null) {
  return useQuery({
    queryKey: ['github-pulls', owner, repo],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/repos/${owner}/${repo}/pulls`);
      return data.data as GitHubPullRequest[];
    },
    enabled: !!owner && !!repo,
    retry: 1,
  });
}

export function useGitHubIssues(owner: string | null, repo: string | null) {
  return useQuery({
    queryKey: ['github-issues', owner, repo],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/repos/${owner}/${repo}/issues`);
      return data.data as GitHubIssue[];
    },
    enabled: !!owner && !!repo,
    retry: 1,
  });
}

export function useGitHubActivity() {
  return useQuery({
    queryKey: ['github-activity'],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/activity`);
      return data.data as Array<{ type: string; repo: string; date: string; summary: string }>;
    },
    retry: 1,
  });
}
