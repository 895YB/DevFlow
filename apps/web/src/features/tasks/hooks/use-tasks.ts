import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Task, TaskComment, TaskActivity } from '@devflow/shared';

const basePath = (wId: string, pId: string) =>
  `/workspaces/${wId}/projects/${pId}/tasks`;

export function useTasks(workspaceId: string | null, projectId: string | null, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['tasks', workspaceId, projectId, params],
    queryFn: async () => {
      const { data } = await apiClient.get(basePath(workspaceId!, projectId!), { params });
      return { tasks: data.data as Task[], meta: data.meta };
    },
    enabled: !!workspaceId && !!projectId,
  });
}

export function useTask(workspaceId: string | null, projectId: string | null, taskId: string | null) {
  return useQuery({
    queryKey: ['task', workspaceId, projectId, taskId],
    queryFn: async () => {
      const { data } = await apiClient.get(`${basePath(workspaceId!, projectId!)}/${taskId}`);
      return data.data as Task;
    },
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
}

export function useCreateTask(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; description?: string; status?: string; priority?: string; assignees?: string[]; labels?: string[]; dueDate?: string | null }) => {
      const { data } = await apiClient.post(basePath(workspaceId, projectId), input);
      return data.data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId, projectId] });
    },
  });
}

export function useUpdateTask(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, ...input }: { taskId: string; [key: string]: unknown }) => {
      const { data } = await apiClient.patch(`${basePath(workspaceId, projectId)}/${taskId}`, input);
      return data.data as Task;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useDeleteTask(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.delete(`${basePath(workspaceId, projectId)}/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId, projectId] });
    },
  });
}

export function useReorderTasks(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tasks: Array<{ taskId: string; status: string; order: number }>) => {
      await apiClient.patch(`${basePath(workspaceId, projectId)}/reorder`, { tasks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId, projectId] });
    },
  });
}

export function useTaskComments(workspaceId: string | null, projectId: string | null, taskId: string | null) {
  return useQuery({
    queryKey: ['task-comments', workspaceId, projectId, taskId],
    queryFn: async () => {
      const { data } = await apiClient.get(`${basePath(workspaceId!, projectId!)}/${taskId}/comments`);
      return data.data as TaskComment[];
    },
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
}

export function useAddComment(workspaceId: string, projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { content: string; mentions?: string[] }) => {
      const { data } = await apiClient.post(`${basePath(workspaceId, projectId)}/${taskId}/comments`, input);
      return data.data as TaskComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
    },
  });
}

export function useTaskActivities(workspaceId: string | null, projectId: string | null, taskId: string | null) {
  return useQuery({
    queryKey: ['task-activities', workspaceId, projectId, taskId],
    queryFn: async () => {
      const { data } = await apiClient.get(`${basePath(workspaceId!, projectId!)}/${taskId}/activities`);
      return data.data as TaskActivity[];
    },
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
}
