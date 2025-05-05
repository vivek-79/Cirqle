"use client"
import ChatBoxHeader from '@/components/chat/ChatBoxHeader';
import MessageInput from '@/components/chat/MessageInput';
import { AccessToken, api } from '@/constants';
import WebSocketProvider from '@/context/WebSockectComp';
import { useStoredUser } from '@/hooks/store.actions';
import { ChatDetails } from '@/types';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';


const ChatBox = () => {

    const [chatDetails, setChatDetails] = useState<ChatDetails>()
    const user = useStoredUser();
    const params = useParams();
    const chatId = Array.isArray(params.id) ? params.id[0] : params.id

    if (!chatId || !user.id) {
        return;
    }

    //fetching chat details and previous messages
    useEffect(()=>{

        try {
            (async()=>{
                const res =await axios.get(`${api}/chat/details/${chatId}`,{
                    params: { id: user.id },
                    withCredentials:true,
                    headers:AccessToken(user.accessToken)
                })
    
                setChatDetails(res.data)
            })()
        } catch (error) {
            
            toast.error("Error getting chat details")
        }
    },[chatId?.slice(0,8)])

    if(!chatDetails) return null;
    return (
       <WebSocketProvider>
            <div className='relative w-full h-full px-2 '>
                {/* Messaging Tool Bar */}
                <MessageInput chatId={chatId} userId={user.id}/>
                <ChatBoxHeader
                    name={chatDetails.isGroup ? chatDetails.name : chatDetails.members[0].name}
                    avatar={chatDetails.isGroup ? chatDetails.groupAvatar : chatDetails.members[0].avatar}
                />
            </div>
       </WebSocketProvider>
    )
}

export default ChatBox