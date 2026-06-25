import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/app/providers/socket-provider';
import { useWorkspace } from '@/app/providers/workspace-provider';
import type { PresenceData } from '@devflow/shared';

/**
 * Called once from DashboardLayout. Joins/leaves the active workspace socket room
 * and populates the presence cache so usePresence() can read from it.
 */
export function useWorkspaceSocket() {
  const { socket } = useSocket();
  const { activeWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !activeWorkspaceId) return;

    socket.emit('workspace:join', activeWorkspaceId);

    const handlePresence = (data: PresenceData) => {
      if (data.workspaceId === activeWorkspaceId) {
        queryClient.setQueryData(['presence', activeWorkspaceId], data.onlineUserIds);
      }
    };

    socket.on('presence:update', handlePresence);

    return () => {
      socket.off('presence:update', handlePresence);
      socket.emit('workspace:leave', activeWorkspaceId);
    };
  }, [socket, activeWorkspaceId, queryClient]);
}
