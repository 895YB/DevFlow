import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useSocket } from '@/app/providers/socket-provider';
import type { Notification } from '@devflow/shared';

export function useNotifications(params?: { unreadOnly?: boolean; cursor?: string }) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const res = await apiClient.get('/notifications', { params });
      return res.data.data as { notifications: Notification[]; hasMore: boolean };
    },
  });
}

export function useUnreadCount() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      queryClient.setQueryData<number>(
        ['notifications:unread-count'],
        (prev) => (prev ?? 0) + 1,
      );
    };
    socket.on('notification:new', handler);
    return () => { socket.off('notification:new', handler); };
  }, [socket, queryClient]);

  return useQuery({
    queryKey: ['notifications:unread-count'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications/unread-count');
      return (res.data.data as { count: number }).count;
    },
    staleTime: 60_000,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications:unread-count'] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.setQueryData(['notifications:unread-count'], 0);
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications:unread-count'] });
    },
  });
}
