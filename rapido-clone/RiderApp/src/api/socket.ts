import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/storage/authStorage';

const SOCKET_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.153.121.121:4000/api').replace(/\/api\/?$/, '');

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) return socket;
  const token = await getAccessToken();
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
