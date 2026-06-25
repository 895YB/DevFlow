import type { Server, Socket } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents } from '@devflow/shared';
import * as chatService from './chat.service.js';
import * as activityService from '../activity/activity.service.js';
import { logger } from '../../utils/logger.js';

interface SocketData { userId: string; displayName: string; avatar: string; }
type IOServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export function setupChatSocketHandlers(io: IOServer, socket: IOSocket): void {
  const { userId, displayName, avatar } = socket.data;

  socket.on('channel:join', (channelId) => {
    socket.join(`channel:${channelId}`);
  });

  socket.on('channel:leave', (channelId) => {
    socket.leave(`channel:${channelId}`);
  });

  socket.on('chat:send', async ({ channelId, content }) => {
    try {
      // Look up the channel to get workspaceId (needed for service + broadcasting)
      const { ChatChannel } = await import('./chat-channel.model.js');
      const channel = await ChatChannel.findById(channelId).lean();
      if (!channel) return;

      const workspaceId = String(channel.workspaceId);

      const message = await chatService.createMessage({
        channelId,
        workspaceId,
        senderId: userId,
        senderName: displayName,
        senderAvatar: avatar,
        content,
      });

      const payload = {
        _id: String(message._id),
        channelId: String(message.channelId),
        workspaceId,
        senderId: userId,
        senderName: displayName,
        senderAvatar: avatar,
        content: message.content,
        editedAt: null,
        deletedAt: null,
        createdAt: message.createdAt.toISOString(),
      };

      io.to(`channel:${channelId}`).emit('chat:message', payload);

      // Record activity and emit to workspace room (non-blocking)
      Promise.all([
        activityService.createActivity({
          workspaceId,
          actorId: userId,
          actorName: displayName,
          actorAvatar: avatar,
          type: 'chat_message_sent',
          resourceType: 'chat',
          resourceId: channelId,
          resourceTitle: `#${channel.name}`,
        }),
      ]).catch((err) => logger.error('Failed to record chat activity', { error: err }));

      io.to(`workspace:${workspaceId}`).emit('activity:new', {
        _id: String(message._id),
        workspaceId,
        actorId: userId,
        actorName: displayName,
        actorAvatar: avatar,
        type: 'chat_message_sent',
        resourceType: 'chat',
        resourceId: channelId,
        resourceTitle: `#${channel.name}`,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      logger.error('chat:send error', { error: err });
    }
  });

  socket.on('chat:edit', async ({ messageId, channelId, content }) => {
    try {
      const { ChatChannel } = await import('./chat-channel.model.js');
      const channel = await ChatChannel.findById(channelId).lean();
      if (!channel) return;

      const message = await chatService.editMessage(String(channel.workspaceId), messageId, userId, content);

      io.to(`channel:${channelId}`).emit('chat:message:edited', {
        messageId: String(message._id),
        content: message.content,
        editedAt: message.editedAt!.toISOString(),
      });
    } catch (err) {
      logger.error('chat:edit error', { error: err });
    }
  });

  socket.on('chat:delete', async ({ messageId, channelId }) => {
    try {
      const { ChatChannel } = await import('./chat-channel.model.js');
      const channel = await ChatChannel.findById(channelId).lean();
      if (!channel) return;

      await chatService.deleteMessage(String(channel.workspaceId), messageId, userId);

      io.to(`channel:${channelId}`).emit('chat:message:deleted', { messageId, channelId });
    } catch (err) {
      logger.error('chat:delete error', { error: err });
    }
  });
}
