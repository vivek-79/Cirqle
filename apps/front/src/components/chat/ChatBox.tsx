"use client"

import { AccessToken, api } from '@/constants'
import { WebSocketContext } from '@/context/WebSockectComp'
import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ChatProps {
    chatId?: string | null,
    userId?: number | null,
    accessToken?: string | null

}

const ChatBox = ({ chatId, userId, accessToken }: ChatProps) => {

    if (!chatId || !userId) {
        return <div>Invalid Chat</div>  // Or a fallback
    }

    const socket = useContext(WebSocketContext);
    const [messages, setMessages] = useState<any>([])

    useEffect(() => {

        if (!chatId || !accessToken) return;

        (async () => {
            try {

                const res = await axios.get(`${api}/chat/details/${chatId}`, {
                    params: {
                        id: userId
                    },
                    withCredentials: true,
                    headers: AccessToken(accessToken)
                })

                setMessages(res?.data?.messages || [])
            } catch (error) {
                toast.error("Error getting messages")
            }
        })()
    }, [chatId])

    useEffect(() => {

        if (!socket) return;

        socket.on("message", (data) => {
            console.log("Message received Chat box");
            console.log(data)

            setMessages((prev:any)=>[...prev,data?.message])
        })

        return () => {
            socket.off("connect");
            socket.off("message")
        }
    }, [socket])

    return (
        <div className='flex-1 text-white px-2 overflow-y-auto pb-6'>
            <ul className='flex-1 flex flex-col gap-4 overflow-y-auto'>
                {messages.length > 0 && (
                    messages.map((message: any,indx:number) => (

                        <li key={indx} className='text-white w-full'>
                            {message.text}
                        </li>
                    ))
                )}
            </ul>
        </div>
    )
}

export default ChatBox