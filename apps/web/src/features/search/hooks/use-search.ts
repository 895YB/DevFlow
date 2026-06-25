import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useWorkspace } from '@/app/providers/workspace-provider';
import type { SearchResult } from '@devflow/shared';

export function useSearch(query: string) {
  const { activeWorkspaceId } = useWorkspace();
  const trimmed = query.trim();

  return useQuery<SearchResult[]>({
    queryKey: ['search', activeWorkspaceId, trimmed],
    queryFn: async () => {
      const res = await apiClient.get(`/workspaces/${activeWorkspaceId}/search`, {
        params: { q: trimmed },
      });
      return res.data.data as SearchResult[];
    },
    enabled: !!activeWorkspaceId && trimmed.length >= 2,
    staleTime: 10_000,
    placeholderData: [],
  });
}
