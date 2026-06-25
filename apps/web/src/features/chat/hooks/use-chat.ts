import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useSocket } from '@/app/providers/socket-provider';
import { useWorkspace } from '@/app/providers/workspace-provider';
import type { ChatChannel, ChatMessage } from '@devflow/shared';

type MessagePage = { messages: ChatMessage[]; hasMore: boolean };

// ── Channels ──────────────────────────────────────────────────────────────────

export function useChannels() {
  const { activeWorkspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['chat-channels', activeWorkspaceId],
    queryFn: async () => {
      const res = await apiClient.get(`/workspaces/${activeWorkspaceId}/chat/channels`);
      return res.data.data as ChatChannel[];
    },
    enabled: !!activeWorkspaceId,
  });
}

export function useCreateChannel() {
  const { activeWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      apiClient.post(`/workspaces/${activeWorkspaceId}/chat/channels`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-channels', activeWorkspaceId] }),
  });
}

export function useDeleteChannel() {
  const { activeWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (channelId: string) =>
      apiClient.delete(`/workspaces/${activeWorkspaceId}/chat/channels/${channelId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-channels', activeWorkspaceId] }),
  });
}

export function useEnsureGeneralChannel() {
  const { activeWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(
        `/workspaces/${activeWorkspaceId}/chat/channels/ensure-general`,
      );
      return res.data.data as ChatChannel;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-channels', activeWorkspaceId] }),
  });
}

// ── Messages ──────────────────────────────────────────────────────────────────

export function useMessages(channelId: string | null) {
  const { activeWorkspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['chat-messages', channelId],
    queryFn: async () => {
      const res = await apiClient.get(
        `/workspaces/${activeWorkspaceId}/chat/channels/${channelId}/messages`,
        { params: { limit: 50 } },
      );
      return res.data.data as MessagePage;
    },
    enabled: !!channelId && !!activeWorkspaceId,
    staleTime: 30_000,
  });
}

export function useLoadMoreMessages(channelId: string | null) {
  const { activeWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cursor: string) => {
      const res = await apiClient.get(
        `/workspaces/${activeWorkspaceId}/chat/channels/${channelId}/messages`,
        { params: { cursor, limit: 50 } },
      );
      return res.data.data as MessagePage;
    },
    onSuccess: (newPage) => {
      queryClient.setQueryData<MessagePage>(['chat-messages', channelId], (old) => {
        if (!old) return newPage;
        // Deduplicate in case of overlap
        const existingIds = new Set(old.messages.map((m) => m._id));
        const fresh = newPage.messages.filter((m) => !existingIds.has(m._id));
        return { messages: [...fresh, ...old.messages], hasMore: newPage.hasMore };
      });
    },
  });
}

// ── Real-time socket handlers ─────────────────────────────────────────────────

export function useChatSocket(channelId: string | null) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !channelId) return;

    socket.emit('channel:join', channelId);

    const appendMessage = (msg: ChatMessage) => {
      if (msg.channelId !== channelId) return;
      queryClient.setQueryData<MessagePage>(['chat-messages', channelId], (old) => {
        if (!old) return { messages: [msg], hasMore: false };
        if (old.messages.some((m) => m._id === msg._id)) return old;
        return { ...old, messages: [...old.messages, msg] };
      });
    };

    const patchMessage = (data: { messageId: string; content: string; editedAt: string }) => {
      queryClient.setQueryData<MessagePage>(['chat-messages', channelId], (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: old.messages.map((m) =>
            m._id === data.messageId ? { ...m, content: data.content, editedAt: data.editedAt } : m,
          ),
        };
      });
    };

    const removeMessage = (data: { messageId: string }) => {
      queryClient.setQueryData<MessagePage>(['chat-messages', channelId], (old) => {
        if (!old) return old;
        return { ...old, messages: old.messages.filter((m) => m._id !== data.messageId) };
      });
    };

    socket.on('chat:message', appendMessage);
    socket.on('chat:message:edited', patchMessage);
    socket.on('chat:message:deleted', removeMessage);

    return () => {
      socket.off('chat:message', appendMessage);
      socket.off('chat:message:edited', patchMessage);
      socket.off('chat:message:deleted', removeMessage);
      socket.emit('channel:leave', channelId);
    };
  }, [socket, channelId, queryClient]);
}

// ── Send / Edit / Delete via socket ──────────────────────────────────────────

export function useSendMessage() {
  const { socket } = useSocket();
  return useCallback(
    (channelId: string, content: string) => {
      socket?.emit('chat:send', { channelId, content });
    },
    [socket],
  );
}

export function useEditMessage() {
  const { socket } = useSocket();
  return useCallback(
    (messageId: string, channelId: string, content: string) => {
      socket?.emit('chat:edit', { messageId, channelId, content });
    },
    [socket],
  );
}

export function useDeleteMessage() {
  const { socket } = useSocket();
  return useCallback(
    (messageId: string, channelId: string) => {
      socket?.emit('chat:delete', { messageId, channelId });
    },
    [socket],
  );
}
