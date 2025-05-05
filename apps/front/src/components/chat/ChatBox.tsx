"use client"

import { WebSocketContext } from '@/context/WebSockectComp'
import React, { useContext, useEffect } from 'react'

interface ChatProps{
    chatId?:string | null,
    userId?:number | null,

}

const ChatBox = ({chatId,userId}:ChatProps) => {
  

    if(!chatId || !userId){
        return 
    }
    const socket = useContext(WebSocketContext)

    useEffect(()=>{

        if(!socket) return;
        
        socket.on("message",(data)=>{
            console.log("Message received");
            console.log(data)
        })

        return ()=>{
            socket.off("connect");
            socket.off("message")
        }
    },[])

    return (
    <div className='w-full h-full'>

    </div>
  )
}

export default ChatBox