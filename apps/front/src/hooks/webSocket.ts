

import { ClientToServerEvents, ServerToClientEvents } from '@/types';
import { Socket } from 'socket.io-client';
import { useStoredUser } from './store.actions';
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

export const useSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> | null => {

  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const user = useStoredUser();

  useEffect(()=>{
    if (!user?.accessToken || socket) return;

    const socketInstance = getSocket(user.accessToken);
    setSocket(socketInstance);
  },[user])

  return socket;
}