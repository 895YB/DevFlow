import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { LeetCodeProfile } from '@devflow/shared';

const base = '/integrations/leetcode';

export function useLeetCodeProfile() {
  return useQuery({
    queryKey: ['leetcode-profile'],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/profile`);
      return data.data as LeetCodeProfile | { connected: false };
    },
  });
}

export function useConnectLeetCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const { data } = await apiClient.post(`${base}/connect`, { username });
      return data.data as LeetCodeProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leetcode-profile'] });
    },
  });
}

export function useDisconnectLeetCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`${base}/disconnect`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leetcode-profile'] });
    },
  });
}

export function useSyncLeetCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`${base}/sync`);
      return data.data as LeetCodeProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leetcode-profile'] });
    },
  });
}

export function useAddManualEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { problemName: string; difficulty: string; notes?: string; solutionCode?: string }) => {
      const { data } = await apiClient.post(`${base}/entries`, input);
      return data.data as LeetCodeProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leetcode-profile'] });
    },
  });
}
