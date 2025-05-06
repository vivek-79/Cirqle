
"use client"

import { createContext, ReactNode, useEffect, useState } from 'react'
import { io ,Socket} from 'socket.io-client'
import { ClientToServerEvents,ServerToClientEvents } from '@/types'
import { useStoredUser } from '@/hooks/store.actions';


export const WebSocketContext = createContext<Socket< ServerToClientEvents,ClientToServerEvents> | null>(null);

const WebSocketProvider = ({children}:{children:ReactNode}) => {

  const [socket,setSocket] = useState<Socket<ServerToClientEvents,ClientToServerEvents> | null>(null)

  const user = useStoredUser()

  useEffect(()=>{

    console.log("WebSocketProvider effect ran");
    if(!user || !user.accessToken){
      return 
    };

    if (socket) {
      console.log("Socket already exists, skipping...");
      return;
    }

    const socketInstance:Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:8081',{
      withCredentials:true,
      auth:{
        token:user.accessToken
      }
    })

    socketInstance.on("connect", () => {
      console.log("WebSocket connected ✅", socketInstance.id, typeof socketInstance.id);
    });
  
    socketInstance.on("connect_error", (err) => {
      console.error("WebSocket connection error ❌", err.message);
    });
    
    setSocket(socketInstance)

    return ()=> {
      console.log("disconected on refresh")
      socketInstance.disconnect();
    }
  },[user])

  return (
    <WebSocketContext.Provider value={socket}>
        {children}
    </WebSocketContext.Provider>
  )
}

export default WebSocketProvider