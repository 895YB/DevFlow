import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import type { ServerToClientEvents, ClientToServerEvents } from '@devflow/shared';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { setupPresenceHandlers } from '../modules/realtime/presence.js';
import { setupChatSocketHandlers } from '../modules/chat/chat-socket.js';

interface SocketData {
  userId: string;
  displayName: string;
  avatar: string;
}

type IOServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

let io: IOServer;

interface JWTPayload {
  sub: string;
  exp: number;
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf-8')) as JWTPayload;
  } catch {
    return null;
  }
}

export function initSocket(httpServer: HttpServer): IOServer {
  io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket, next) => {
    try {
      const raw =
        (socket.handshake.auth['token'] as string | undefined) ??
        (socket.handshake.query['token'] as string | undefined);

      if (!raw) { next(new Error('Authentication required')); return; }

      const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
      const payload = decodeJWT(token);

      if (!payload) { next(new Error('Invalid token')); return; }
      if (payload.exp * 1000 < Date.now()) { next(new Error('Token expired')); return; }

      socket.data.userId = payload.sub;

      // Pre-fetch display name so chat handlers avoid per-message DB lookups
      const { User } = await import('../modules/users/user.model.js');
      const user = await User.findOne({ clerkId: payload.sub }).select('displayName firstName avatar').lean();
      socket.data.displayName = (user?.displayName || user?.firstName || 'Unknown') as string;
      socket.data.avatar = (user?.avatar || '') as string;

      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id, userId: socket.data.userId });

    // Join personal room for targeted notifications
    socket.join(`user:${socket.data.userId}`);

    setupPresenceHandlers(io, socket);
    setupChatSocketHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { socketId: socket.id, userId: socket.data.userId, reason });
    });
  });

  return io;
}

export function getIO(): IOServer {
  if (!io) throw new Error('Socket server not initialized');
  return io;
}
