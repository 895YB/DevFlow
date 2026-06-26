import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { User } from '@devflow/shared';

const QUERY_KEY = ['users', 'me'];

export function useProfile() {
  const qc = useQueryClient();

  const query = useQuery<User>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient.get('/users/me');
      return res.data.data as User;
    },
    staleTime: 5 * 60_000,
  });

  const updateProfile = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.patch('/users/me', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateAvatar = useMutation({
    mutationFn: (avatarUrl: string) => apiClient.patch('/users/me/avatar', { avatarUrl }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const removeAvatar = useMutation({
    mutationFn: () => apiClient.delete('/users/me/avatar'),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updatePreferences = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.patch('/users/me/preferences', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteAccount = useMutation({
    mutationFn: () => apiClient.delete('/users/me'),
  });

  return {
    ...query,
    updateProfile,
    updateAvatar,
    removeAvatar,
    updatePreferences,
    deleteAccount,
  };
}
