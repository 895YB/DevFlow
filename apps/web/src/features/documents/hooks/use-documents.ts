import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Document, DocumentTreeNode, DocumentVersion } from '@devflow/shared';

const basePath = (wId: string) => `/workspaces/${wId}/documents`;

export function useDocumentTree(workspaceId: string | null) {
  return useQuery({
    queryKey: ['document-tree', workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get(basePath(workspaceId!));
      return data.data as DocumentTreeNode[];
    },
    enabled: !!workspaceId,
  });
}

export function useDocument(workspaceId: string | null, documentId: string | null) {
  return useQuery({
    queryKey: ['document', workspaceId, documentId],
    queryFn: async () => {
      const { data } = await apiClient.get(`${basePath(workspaceId!)}/${documentId}`);
      return data.data as Document;
    },
    enabled: !!workspaceId && !!documentId,
  });
}

export function useCreateDocument(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; content?: string; parent?: string | null }) => {
      const { data } = await apiClient.post(basePath(workspaceId), input);
      return data.data as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-tree', workspaceId] });
    },
  });
}

export function useUpdateDocument(workspaceId: string, documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title?: string; content?: string; icon?: string }) => {
      const { data } = await apiClient.patch(`${basePath(workspaceId)}/${documentId}`, input);
      return data.data as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', workspaceId, documentId] });
      queryClient.invalidateQueries({ queryKey: ['document-tree', workspaceId] });
    },
  });
}

export function useDeleteDocument(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      await apiClient.delete(`${basePath(workspaceId)}/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-tree', workspaceId] });
    },
  });
}

export function useSearchDocuments(workspaceId: string | null, query: string) {
  return useQuery({
    queryKey: ['document-search', workspaceId, query],
    queryFn: async () => {
      const { data } = await apiClient.get(`${basePath(workspaceId!)}/search`, {
        params: { q: query },
      });
      return data.data as Array<{ _id: string; title: string; icon: string }>;
    },
    enabled: !!workspaceId && query.trim().length >= 2,
  });
}

// Versions
export function useDocumentVersions(workspaceId: string | null, documentId: string | null) {
  return useQuery({
    queryKey: ['document-versions', workspaceId, documentId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `${basePath(workspaceId!)}/${documentId}/versions`,
      );
      return data.data as DocumentVersion[];
    },
    enabled: !!workspaceId && !!documentId,
  });
}

export function useRestoreVersion(workspaceId: string, documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (versionId: string) => {
      const { data } = await apiClient.post(
        `${basePath(workspaceId)}/${documentId}/versions/${versionId}/restore`,
      );
      return data.data as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', workspaceId, documentId] });
      queryClient.invalidateQueries({ queryKey: ['document-versions', workspaceId, documentId] });
    },
  });
}
