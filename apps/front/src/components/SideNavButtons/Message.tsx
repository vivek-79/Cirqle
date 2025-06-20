
"use client"

import { useUnseenMessageActions, useGetUnseenMessageCount, useStoredUser } from "@/hooks/store.actions";
import { useSocket } from "@/hooks/webSocket";
import { useEffect } from "react";
import { TbMessageCircleBolt } from "react-icons/tb";
import StoreProviderWrapper from "../Store-layouts/StoreProviderWrapper";
import { newMessageSound, SOUND_TYPE } from "@/helpers/sounds";
import { UNSEEN_MESSAGES } from "@/types";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { path } from "@/constants";
type Message = { id: string; chatId: string };

const Message = () => {
    
    
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

                console.log("received at button");


                const message = data.messages[0];
                if(!message) return;
                //updating store
                addMessage({ chatId: data.id, messageIds: [data.messages[0].id] })

                //update last message
                const modifiedMesssage ={
                    id: message.id,
                    photo: message.photo,
                    text: message.text,
                    createdAt: message.createdAt,
                    seen: message.sender.id === userId
                }
                currentMessage({ chatId: data.id, message: modifiedMesssage })

                //sending acknowledgement to server
                //filtering out messageIds from other users
                const isSameSender = message.sender.id == userId;

                if (!isSameSender) {

                    socket.emit("messageAcknowledge", {

                        messageIds: [message.id],
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
        <div className="side-nav-btn">
            <StoreProviderWrapper>
                <DisplayButton count={unseenMessageCount} />
            </StoreProviderWrapper>
            <span className="max-xl:hidden block">Messages</span>
        </div>
    )
}

export default Message;


const DisplayButton = ({ count }: { count: number }) => {


    const user = useStoredUser();
    const socket = useSocket();

    useEffect(() => {

        if (!socket || !user || !user.accessToken) {
            return;
        }
    }, [socket, user])

    return (
        <Link href={`${path}/messages`} className="relative h-7 w-7 ">
            <span className="absolute -top-1 left-[80%] text-xs text-blue-400 bg-gray-700 px-1 rounded-full">{count > 0 ? count : ''}</span>
            <TbMessageCircleBolt size={26} className="text-white hover-black" />
        </Link>
    )
}