import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useWorkspace } from '@/app/providers/workspace-provider';
import type { WorkspaceRole } from '@devflow/shared';

export function useWorkspaceSettings() {
  const { activeWorkspaceId } = useWorkspace();
  const qc = useQueryClient();

  const workspaceKey = ['workspace', activeWorkspaceId];
  const membersKey = ['workspace', activeWorkspaceId, 'members'];

  const workspace = useQuery({
    queryKey: workspaceKey,
    queryFn: async () => {
      const res = await apiClient.get(`/workspaces/${activeWorkspaceId}`);
      return res.data.data;
    },
    enabled: !!activeWorkspaceId,
    staleTime: 60_000,
  });

  const members = useQuery({
    queryKey: membersKey,
    queryFn: async () => {
      const res = await apiClient.get(`/workspaces/${activeWorkspaceId}/members`);
      return res.data.data as Array<{
        _id: string;
        user: { _id: string; displayName: string; email: string; avatar: string };
        role: WorkspaceRole;
        joinedAt: string;
      }>;
    },
    enabled: !!activeWorkspaceId,
    staleTime: 60_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: workspaceKey });
    qc.invalidateQueries({ queryKey: membersKey });
  };

  const updateWorkspace = useMutation({
    mutationFn: (data: { name?: string; description?: string; icon?: string }) =>
      apiClient.patch(`/workspaces/${activeWorkspaceId}`, data),
    onSuccess: invalidate,
  });

  const inviteMember = useMutation({
    mutationFn: (data: { email: string; role: WorkspaceRole }) =>
      apiClient.post(`/workspaces/${activeWorkspaceId}/members/invite`, data),
    onSuccess: invalidate,
  });

  const updateMemberRole = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: WorkspaceRole }) =>
      apiClient.patch(`/workspaces/${activeWorkspaceId}/members/${memberId}`, { role }),
    onSuccess: invalidate,
  });

  const removeMember = useMutation({
    mutationFn: (memberId: string) =>
      apiClient.delete(`/workspaces/${activeWorkspaceId}/members/${memberId}`),
    onSuccess: invalidate,
  });

  const leaveWorkspace = useMutation({
    mutationFn: () =>
      apiClient.post(`/workspaces/${activeWorkspaceId}/members/leave`),
  });

  const deleteWorkspace = useMutation({
    mutationFn: () => apiClient.delete(`/workspaces/${activeWorkspaceId}`),
  });

  return {
    workspace,
    members,
    updateWorkspace,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
    deleteWorkspace,
    activeWorkspaceId,
  };
}
