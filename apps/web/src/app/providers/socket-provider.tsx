import { createContext, useContext, useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@devflow/shared';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextValue {
  socket: AppSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false });

const SOCKET_URL: string =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ??
  ((import.meta.env.VITE_API_URL as string | undefined)?.replace('/api/v1', '') ?? 'http://localhost:5000');

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let s: AppSocket | null = null;
    let cancelled = false;

    async function connect() {
      let token: string | null = null;
      try {
        if (window.Clerk?.session) {
          token = await window.Clerk.session.getToken();
        }
      } catch {
        // Clerk not ready — connect without token (server will reject and socket will retry)
      }

      if (cancelled) return;

      s = io(SOCKET_URL, {
        auth: { token: token ? `Bearer ${token}` : '' },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      s.on('connect', () => { if (!cancelled) setIsConnected(true); });
      s.on('disconnect', () => { if (!cancelled) setIsConnected(false); });

      if (!cancelled) setSocket(s);
    }

    connect();

    return () => {
      cancelled = true;
      s?.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
