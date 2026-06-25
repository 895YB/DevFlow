import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Project } from '@devflow/shared';

export function useProjects(workspaceId: string | null) {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/workspaces/${workspaceId}/projects`);
      return data.data as Project[];
    },
    enabled: !!workspaceId,
  });
}

export function useProject(workspaceId: string | null, projectId: string | null) {
  return useQuery({
    queryKey: ['project', workspaceId, projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/workspaces/${workspaceId}/projects/${projectId}`);
      return data.data as Project;
    },
    enabled: !!workspaceId && !!projectId,
  });
}

export function useCreateProject(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; description?: string; color?: string }) => {
      const { data } = await apiClient.post(`/workspaces/${workspaceId}/projects`, input);
      return data.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
}

export function useUpdateProject(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name?: string; description?: string; color?: string }) => {
      const { data } = await apiClient.patch(`/workspaces/${workspaceId}/projects/${projectId}`, input);
      return data.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['project', workspaceId, projectId] });
    },
  });
}

export function useDeleteProject(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      await apiClient.delete(`/workspaces/${workspaceId}/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
}
