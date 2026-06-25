import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useWorkspace } from '@/app/providers/workspace-provider';
import type { DashboardData } from '@devflow/shared';

export function useDashboard() {
  const { activeWorkspaceId } = useWorkspace();

  return useQuery<DashboardData>({
    queryKey: ['dashboard', activeWorkspaceId],
    queryFn: async () => {
      const res = await apiClient.get(`/workspaces/${activeWorkspaceId}/dashboard`);
      return res.data.data as DashboardData;
    },
    enabled: !!activeWorkspaceId,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
