import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useWorkspace } from '@/app/providers/workspace-provider';
import type { AnalyticsData, AnalyticsPeriod } from '@devflow/shared';

export function useAnalytics(period: AnalyticsPeriod) {
  const { activeWorkspaceId } = useWorkspace();

  return useQuery<AnalyticsData>({
    queryKey: ['analytics', activeWorkspaceId, period],
    queryFn: async () => {
      const res = await apiClient.get(`/workspaces/${activeWorkspaceId}/analytics`, {
        params: { period },
      });
      return res.data.data as AnalyticsData;
    },
    enabled: !!activeWorkspaceId,
    staleTime: 5 * 60_000,
  });
}
