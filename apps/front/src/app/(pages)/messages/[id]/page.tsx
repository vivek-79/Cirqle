"use client"
import ChatBox, { PROCESSED_MESSAGE } from '@/components/chat/ChatBox';
import ChatBoxHeader from '@/components/chat/ChatBoxHeader';
import MessageInput from '@/components/chat/MessageInput';
import { AccessToken, api } from '@/constants';
import { useStoredUser } from '@/hooks/store.actions';
import {useSocket} from '@/hooks/webSocket';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';


const ChatComp = () => {

    const [chatDetails, setChatDetails] = useState<PROCESSED_MESSAGE | null | undefined>(null)
    const user = useStoredUser();
    const params = useParams();
    const chatId = Array.isArray(params.id) ? params.id[0] : params.id
    if (!chatId || !user.id) {
        return;
    }

    //fetching chat details and previous messages
    useEffect(() => {

        try {
            (async () => {
                const res = await axios.get(`${api}/chat/details/${chatId}`, {
                    params: { id: user.id },
                    withCredentials: true,
                    headers: AccessToken(user.accessToken)
                })

                setChatDetails(res.data)
            })()
        } catch (error) {

            toast.error("Error getting chat details")
        }
    }, [chatId?.slice(0, 8)])

    if (!chatDetails) return;

    return (

        <div className='relative w-full h-dvh flex flex-col overflow-hidden pb-10'>
            {/* Messaging Tool Bar */}
            <ChatBoxHeader
                name={chatDetails.isGroup ? chatDetails.name : chatDetails.members[0].name}
                avatar={chatDetails.isGroup ? chatDetails.groupAvatar : chatDetails.members[0].avatar}
            />

            {/* Chat Box */}
            <ChatBox chatId={chatId} userId={user.id} accessToken={user.accessToken} data={chatDetails} />
            <MessageInput chatId={chatId} userId={user.id} />
        </div>
    )
}

export default ChatComp