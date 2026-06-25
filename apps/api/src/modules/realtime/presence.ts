import type { Server, Socket } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents } from '@devflow/shared';

interface SocketData { userId: string; displayName: string; avatar: string; }
type IOServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

// workspaceId -> Map<socketId, userId>
const presenceMap = new Map<string, Map<string, string>>();

function onlineUserIds(workspaceId: string): string[] {
  const members = presenceMap.get(workspaceId);
  if (!members) return [];
  return [...new Set(members.values())];
}

export function setupPresenceHandlers(io: IOServer, socket: IOSocket): void {
  const userId = socket.data.userId;

  socket.on('workspace:join', (workspaceId) => {
    socket.join(`workspace:${workspaceId}`);

    if (!presenceMap.has(workspaceId)) presenceMap.set(workspaceId, new Map());
    presenceMap.get(workspaceId)!.set(socket.id, userId);

    io.to(`workspace:${workspaceId}`).emit('presence:update', {
      workspaceId,
      onlineUserIds: onlineUserIds(workspaceId),
    });
  });

  socket.on('workspace:leave', (workspaceId) => {
    socket.leave(`workspace:${workspaceId}`);
    presenceMap.get(workspaceId)?.delete(socket.id);

    io.to(`workspace:${workspaceId}`).emit('presence:update', {
      workspaceId,
      onlineUserIds: onlineUserIds(workspaceId),
    });
  });

  socket.on('disconnect', () => {
    for (const [workspaceId, members] of presenceMap) {
      if (members.has(socket.id)) {
        members.delete(socket.id);
        io.to(`workspace:${workspaceId}`).emit('presence:update', {
          workspaceId,
          onlineUserIds: onlineUserIds(workspaceId),
        });
      }
    }
  });
}
