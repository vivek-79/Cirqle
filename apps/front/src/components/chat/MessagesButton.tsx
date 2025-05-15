
"use client"

import { useUnseenMessageActions, useGetUnseenMessageCount, useStoredUser } from "@/hooks/store.actions";
import { useSocket } from "@/hooks/webSocket";
import { useEffect } from "react";
import { TbMessageCircleBolt } from "react-icons/tb";
import StoreProviderWrapper from "../Store-layouts/StoreProviderWrapper";
import { newMessageSound, SOUND_TYPE } from "@/helpers/sounds";
import { UNSEEN_MESSAGES } from "@/types";
import { usePathname } from "next/navigation";
type Message = { id: string; chatId: string };

const MessagesButton = () => {
    
    
    const pathname = usePathname()
    const socket = useSocket();
    const user = useStoredUser();
    const unseenMessageCount = useGetUnseenMessageCount()
    const { addMessage ,currentMessage} = useUnseenMessageActions()
    
    //return if no user
    if(!user || !user.id) {
        return;
    }

    const userId = user.id;


    // single real time message handler
    useEffect(() => {

        if (!socket || pathname.startsWith('/messages/')) return;

        try {

            socket.on("message", (data) => {

                if (!data || !data.messages) return;

                console.log("received at button")
                //updating store
                addMessage({ chatId: data.id, messageIds: [data.messages.id] })

                //update last message
                const modifiedMesssage ={
                    id:data.messages.id,
                    photo:data.messages.photo,
                    text:data.messages.text,
                    createdAt:data.messages.createdAt,
                    seen: data.messages.sender.id === userId
                }
                currentMessage({ chatId: data.id, message: modifiedMesssage })

                //sending acknowledgement to server
                //filtering out messageIds from other users
                const isSameSender = data.messages?.sender.id == userId;

                if (!isSameSender) {

                    socket.emit("messageAcknowledge", {

                        messageIds: [data.messages.id],
                        chatId: data.id,
                        userId,
                        acknowledge: "DELIVERED"
                    })
                }

                //sound of message
                newMessageSound({type:SOUND_TYPE.MESSAGE})
            })

            return () => {
                socket.off("connect");
                socket.off("message");
            }
        } catch (error) {

            console.log("Error while getting and sending message ack", error)
        }
    }, [socket, pathname])

    //previous bulk message handler
    useEffect(() => {
        if (!socket || !userId) return;

        // Emit event to get message count
        socket.emit("getUndeliveredMessagesCount", { userId });
        socket.emit("getUnseenMessages", { userId });

        // Handler
        const undeliveredMessageHandler = async (data: UNSEEN_MESSAGES[]) => {

            const messagesFromOtherUsers = data.filter((msg) => msg.senderId !== userId)

            //grouping based on chatId
            const groupedMessage = messagesFromOtherUsers.reduce((acc, curr) => {

                if (!acc[curr.chatId]) {
                    acc[curr.chatId] = [];
                }

                acc[curr.chatId].push(curr.id)

                return acc;
            }, {} as Record<string, string[]>);

            //sending back ack
            if (groupedMessage) {

                await Promise.all(

                    Object.entries(groupedMessage).map(([chatId, messageIds]) => {

                        return new Promise<void>((resolve) => {

                            socket.emit("messageAcknowledge", {
                                messageIds,
                                chatId,
                                userId,
                                acknowledge: "DELIVERED"
                            });

                            resolve()
                        })
                    })

                )
            }


        };

        const unSeenMessageHandler = async (data: UNSEEN_MESSAGES[]) => {
            const messagesFromOtherUsers = data.filter((msg) => msg.senderId !== userId)

            //grouping based on chatId
            const groupedMessage = messagesFromOtherUsers.reduce((acc, curr) => {

                if (!acc[curr.chatId]) {
                    acc[curr.chatId] = [];
                }

                acc[curr.chatId].push(curr.id)

                return acc;
            }, {} as Record<string, string[]>);


            if (groupedMessage) {

                Object.entries(groupedMessage).map(([chatId, messageIds]) => {
                    addMessage({ chatId, messageIds: [...messageIds] });

                })

            }

        }
        // Listen
        socket.on("undeliveredMessagesCount", undeliveredMessageHandler);
        socket.on("UnseenMessages", unSeenMessageHandler)

        // Cleanup
        return () => {
            socket.off("undeliveredMessagesCount", undeliveredMessageHandler);
            socket.off("UnseenMessages", unSeenMessageHandler)
        };
    }, [socket, userId]);

    return (
        <>
            <StoreProviderWrapper>
                <DisplayButton count={unseenMessageCount} />
            </StoreProviderWrapper>
        </>
    )
}

export default MessagesButton;


const DisplayButton = ({ count }: { count: number }) => {


    const user = useStoredUser();
    const socket = useSocket();

    useEffect(() => {

        if (!socket || !user || !user.accessToken) {
            return;
        }
    }, [socket, user])

    return (
        <span className="relative h-7 w-7 ">
            <span className="absolute -top-1 left-[80%] text-xs text-blue-400 bg-gray-700 px-1 rounded-full">{count > 0 ? count : ''}</span>
            <TbMessageCircleBolt size={26} className="text-white hover-black" />
        </span>
    )
}