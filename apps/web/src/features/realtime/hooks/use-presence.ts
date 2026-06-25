import { useQuery } from '@tanstack/react-query';

/**
 * Returns the list of online user IDs for the given workspace.
 * Data is populated by useWorkspaceSocket() via React Query cache — no fetch needed.
 */
export function usePresence(workspaceId: string | null) {
  const { data: onlineUserIds = [] } = useQuery<string[]>({
    queryKey: ['presence', workspaceId],
    queryFn: () => [],
    staleTime: Infinity,
    enabled: !!workspaceId,
  });
  return { onlineUserIds };
}
