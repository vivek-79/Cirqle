
"use client"

import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '@/types'



let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const getSocket = (token: string): Socket<ServerToClientEvents, ClientToServerEvents> | null => {

    if(!socket){
      socket = io('http://localhost:8081', {
        withCredentials: true,
        auth: {
          token
        }
      })
    }
  socket.on("connect", () => {
    console.log("WebSocket connected ✅");
    });

  socket.on("connect_error", (err) => {
      console.error("WebSocket connection error ❌", err.message);
    });

  return socket;
}
