import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Snippet, SnippetFolder } from '@devflow/shared';

const basePath = (wId: string) => `/workspaces/${wId}/snippets`;

export function useSnippets(
  workspaceId: string | null,
  params?: Record<string, string>,
) {
  return useQuery({
    queryKey: ['snippets', workspaceId, params],
    queryFn: async () => {
      const { data } = await apiClient.get(basePath(workspaceId!), { params });
      return { snippets: data.data as Snippet[], meta: data.meta };
    },
    enabled: !!workspaceId,
  });
}

export function useSnippet(workspaceId: string | null, snippetId: string | null) {
  return useQuery({
    queryKey: ['snippet', workspaceId, snippetId],
    queryFn: async () => {
      const { data } = await apiClient.get(`${basePath(workspaceId!)}/${snippetId}`);
      return data.data as Snippet;
    },
    enabled: !!workspaceId && !!snippetId,
  });
}

export function useCreateSnippet(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      language: string;
      code: string;
      description?: string;
      tags?: string[];
      folder?: string | null;
      visibility?: 'personal' | 'team';
    }) => {
      const { data } = await apiClient.post(basePath(workspaceId), input);
      return data.data as Snippet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets', workspaceId] });
    },
  });
}

export function useUpdateSnippet(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      snippetId,
      ...input
    }: {
      snippetId: string;
      title?: string;
      language?: string;
      code?: string;
      description?: string;
      tags?: string[];
      folder?: string | null;
      visibility?: 'personal' | 'team';
    }) => {
      const { data } = await apiClient.patch(`${basePath(workspaceId)}/${snippetId}`, input);
      return data.data as Snippet;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['snippets', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['snippet', workspaceId, variables.snippetId] });
    },
  });
}

export function useDeleteSnippet(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (snippetId: string) => {
      await apiClient.delete(`${basePath(workspaceId)}/${snippetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets', workspaceId] });
    },
  });
}

export function useToggleFavorite(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (snippetId: string) => {
      const { data } = await apiClient.post(`${basePath(workspaceId)}/${snippetId}/favorite`);
      return data.data as Snippet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets', workspaceId] });
    },
  });
}

// Folders
export function useSnippetFolders(workspaceId: string | null) {
  return useQuery({
    queryKey: ['snippet-folders', workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get(`${basePath(workspaceId!)}/folders`);
      return data.data as SnippetFolder[];
    },
    enabled: !!workspaceId,
  });
}

export function useCreateSnippetFolder(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; parent?: string | null }) => {
      const { data } = await apiClient.post(`${basePath(workspaceId)}/folders`, input);
      return data.data as SnippetFolder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippet-folders', workspaceId] });
    },
  });
}

export function useDeleteSnippetFolder(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (folderId: string) => {
      await apiClient.delete(`${basePath(workspaceId)}/folders/${folderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippet-folders', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['snippets', workspaceId] });
    },
  });
}
