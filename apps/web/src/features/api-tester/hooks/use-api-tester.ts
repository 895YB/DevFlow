import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  ApiCollection,
  ApiEnvironment,
  ApiHistoryEntry,
  ApiResponseData,
  ProxyRequestInput,
  CreateCollectionInput,
  UpdateCollectionInput,
  ApiRequestInput,
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
} from '@devflow/shared';

const base = '/integrations/api-tester';

// ─── Proxy ───────────────────────────────────────────────────────────────────

export function useExecuteProxy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProxyRequestInput): Promise<ApiResponseData> => {
      const { data } = await apiClient.post(`${base}/proxy`, input);
      return data.data as ApiResponseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-history'] });
    },
  });
}

// ─── History ─────────────────────────────────────────────────────────────────

export function useApiHistory() {
  return useQuery({
    queryKey: ['api-history'],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/history`);
      return data.data as ApiHistoryEntry[];
    },
  });
}

export function useClearHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`${base}/history`);
    },
    onSuccess: () => {
      queryClient.setQueryData(['api-history'], []);
    },
  });
}

// ─── Collections ─────────────────────────────────────────────────────────────

export function useCollections() {
  return useQuery({
    queryKey: ['api-collections'],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/collections`);
      return data.data as ApiCollection[];
    },
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCollectionInput) => {
      const { data } = await apiClient.post(`${base}/collections`, input);
      return data.data as ApiCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-collections'] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      collectionId,
      input,
    }: {
      collectionId: string;
      input: UpdateCollectionInput;
    }) => {
      const { data } = await apiClient.put(`${base}/collections/${collectionId}`, input);
      return data.data as ApiCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-collections'] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (collectionId: string) => {
      await apiClient.delete(`${base}/collections/${collectionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-collections'] });
    },
  });
}

// ─── Requests ────────────────────────────────────────────────────────────────

export function useAddRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      collectionId,
      input,
    }: {
      collectionId: string;
      input: ApiRequestInput;
    }) => {
      const { data } = await apiClient.post(
        `${base}/collections/${collectionId}/requests`,
        input,
      );
      return data.data as ApiCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-collections'] });
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      collectionId,
      requestId,
      input,
    }: {
      collectionId: string;
      requestId: string;
      input: Partial<ApiRequestInput>;
    }) => {
      const { data } = await apiClient.put(
        `${base}/collections/${collectionId}/requests/${requestId}`,
        input,
      );
      return data.data as ApiCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-collections'] });
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      collectionId,
      requestId,
    }: {
      collectionId: string;
      requestId: string;
    }) => {
      const { data } = await apiClient.delete(
        `${base}/collections/${collectionId}/requests/${requestId}`,
      );
      return data.data as ApiCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-collections'] });
    },
  });
}

// ─── Environments ─────────────────────────────────────────────────────────────

export function useEnvironments() {
  return useQuery({
    queryKey: ['api-environments'],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/environments`);
      return data.data as ApiEnvironment[];
    },
  });
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateEnvironmentInput) => {
      const { data } = await apiClient.post(`${base}/environments`, input);
      return data.data as ApiEnvironment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-environments'] });
    },
  });
}

export function useUpdateEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      envId,
      input,
    }: {
      envId: string;
      input: UpdateEnvironmentInput;
    }) => {
      const { data } = await apiClient.put(`${base}/environments/${envId}`, input);
      return data.data as ApiEnvironment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-environments'] });
    },
  });
}

export function useDeleteEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (envId: string) => {
      await apiClient.delete(`${base}/environments/${envId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-environments'] });
    },
  });
}

export function useActivateEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (envId: string) => {
      const { data } = await apiClient.patch(`${base}/environments/${envId}/activate`);
      return data.data as ApiEnvironment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-environments'] });
    },
  });
}
