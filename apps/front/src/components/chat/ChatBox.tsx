"use client"

import { AccessToken, api } from '@/constants'
import axios from 'axios'
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ClipLoader } from 'react-spinners'
import { GoChevronDown } from "react-icons/go";
import { newMessageSound } from '@/helpers/sounds'
import { getTimeForMessage } from '@/helpers/timeConverter'
import { LocalStorageMessage, MessageContext } from '@/context/MessageContext'
import { CiClock2 } from "react-icons/ci";
import { CiRedo } from "react-icons/ci";
import { MESSAGE_ACKNOWLEDGEMENT } from '@/types'
import { MessageStatus } from '@/helpers/MessageStatus'
import {useSocket} from '@/hooks/webSocket'
import { useUnseenMessageActions } from '@/hooks/store.actions'
import { usePathname } from 'next/navigation'

interface ChatProps {
    chatId?: string | null,
    userId?: number | null,
    accessToken?: string | null
    data?: PROCESSED_MESSAGE | null
}

export type CHAT_MEMBERS = {
    id: number
    name: string
    avatar?: string | null
}

export type MESSAGE = {
    text: string | null
    photo: string | null
    createdAt: Date
    updatedAt: Date
    id: string
    seenBy: CHAT_MEMBERS[]
    sender: CHAT_MEMBERS
    localId?: number,
    status?: "SENT" | "DELIVERED" | "READ"
}
export type PROCESSED_MESSAGE = {
    id: string,
    isGroup?: boolean
    name?: string
    groupAvatar?: string | null
    members: CHAT_MEMBERS[]

    messages: MESSAGE[]
}

export type localStorageMessage = {
    text?: string | null
    photo?: File | null
    chatId: string
    senderId: number,
    localId: number
}


const ChatBox = ({ chatId, userId, accessToken, data }: ChatProps) => {

    if (!chatId || !userId) {
        return <div>Invalid Chat</div>  // Or a fallback
    }

    //getting messages context
    const localMessageContext = useContext(MessageContext);
    const socket = useSocket();
    const { removeMessage , currentMessage} = useUnseenMessageActions()
    const containerRef = useRef<HTMLUListElement | null>(null)
    const [chatInfo, setChatInfo] = useState<PROCESSED_MESSAGE | null | undefined>(data);
    const [hasScrolled, setHasScrolled] = useState<boolean>();
    const hasScrollFetchedRef = useRef(false);
    const topRef = useRef<HTMLDivElement>(null);
    const moveTOBottomRef = useRef<HTMLButtonElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [retryingMessageId, setRetryingMessageId] = useState<number | null>(null);
    const seenMessageRefs = useRef<Record<string, HTMLLIElement | null>>({});
    const newlySeenMessageRefs = useRef<string[]>([]);
    const pageRef = useRef(2);
    const pathname = usePathname()

    //removing from unseen

    //fetching real-time messages
    useEffect(() => {

        if (!socket || !pathname.endsWith(chatId)) return;

        try {
            //getting messages from local storage
            const localMessage = localMessageContext?.messages?.filter((message) => message.chatId === chatId);

            socket.on("message", (data) => {

                if (!data || !data.messages) return;

                setChatInfo((prev) => {

                    if (!prev) return {
                        id: data.id,
                        members: data.members,
                        messages: [data.messages]
                    }

                    return {
                        ...prev,
                        messages: [data.messages, ...prev.messages],
                    }
                })

                //setting to current
                const modifiedMesssage = {
                    id: data.id,
                    photo: data.messages.photo,
                    text: data.messages.text,
                    createdAt: data.messages.createdAt,
                    seen: false
                }
                currentMessage({ chatId: data.id, message: modifiedMesssage })

                //sending acknowledgement to server
                const isSameSender = data.messages?.sender.id == userId;

                if (!isSameSender) {

                    socket.emit("messageAcknowledge", {

                        messageIds: [data.messages.id],
                        chatId: data.id,
                        userId,
                        acknowledge: "DELIVERED"
                    })
                }

                //filtering out messageIds from other users

                //clearing local storage messages if same message is received
                if (localMessageContext && localMessage && localMessage?.length > 0) {

                    localMessageContext.clearMessages(data.messages?.localId)
                    const isRetriedMessage = retryingMessageId === data.messages?.localId;

                    if (isRetriedMessage) {
                        setRetryingMessageId(null);
                    }
                }

                //sound of message
                newMessageSound()
            })

            return () => {
                socket.off("connect");
                socket.off("message");
            }
        } catch (error) {

            console.log("Error while getting and sending message ack", error)
        }
    }, [socket, retryingMessageId, chatId, localMessageContext,pathname])

    //Received acknowledgement of message
    useEffect(() => {

        if (!socket || !chatId) return;

        //acknowledgement of message

        const handleMessageAck = (data: MESSAGE_ACKNOWLEDGEMENT) => {

            const { messageIds, chatId: receivedChatId, acknowledge } = data;

            if (chatId !== receivedChatId) return;

            setChatInfo((prev) => {
                if (!prev) return null;

                const updatedMessages = prev.messages.map((message) => {

                    if (message.status === "READ") return message;

                    const messageId = message.id;
                    const toUpdateMessage = messageIds.find((msgId) => msgId === messageId);
                    if (!toUpdateMessage) return message;

                    //updating message status

                    message.status = acknowledge;

                    return message;
                })

                return {
                    ...prev,
                    messages: updatedMessages
                }
            })
        }

        socket.on("messageAcknowledgement", handleMessageAck);

        return () => {
            socket.off("messageAcknowledgement", handleMessageAck);
        }
    }, [chatId, socket])

    //scrolling to bottom chat
    useLayoutEffect(() => {

        const elem = containerRef.current;

        if (!hasScrolled && elem) {
            elem.scrollTop = elem.scrollHeight
            setHasScrolled(true);
        }


    }, [hasScrolled])

    //infinite scrolling
    useEffect(() => {

        const topEl = topRef.current
        const containerEl = containerRef.current;
        const button = moveTOBottomRef.current;
        if (!containerEl || !topEl) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasScrollFetchedRef.current) {

                    (async () => {
                        setIsLoading(true);
                        hasScrollFetchedRef.current = true;

                        try {

                            //request to backend
                            const res = await axios.get(`${api}/messages/${chatId}`, {
                                params: {
                                    page: pageRef.current
                                },
                                withCredentials: true,
                                headers: AccessToken(accessToken)
                            })

                            //validation and setting to array
                            if (res.data && res.data.length > 0) {

                                setChatInfo((prev) => {

                                    if (!prev) {
                                        return null;
                                    }
                                    return {

                                        ...prev,
                                        messages: [...prev?.messages, ...res.data]
                                    }
                                })

                                //increasing page size
                                pageRef.current += 1;
                                hasScrollFetchedRef.current = false;
                                setIsLoading(false);
                            }
                            else {

                                hasScrollFetchedRef.current = true;
                                setIsLoading(false);
                            }


                        } catch (error) {
                            toast.error("Error getting messages")
                            hasScrollFetchedRef.current = false;
                        }
                    })()
                }
            },
            {
                root: containerEl,
                threshold: 0.1, // Adjust as needed
            }
        );

        observer.observe(topEl);

        const showMoveToBottomButton = () => {

            if (!containerEl || !button) return;
            const shouldShow = Math.abs(containerEl.scrollTop) > containerEl.clientHeight;
            const isHidden = button.style.display === "none";
            if (shouldShow && isHidden) {
                button.style.display = "flex";

            }
            else if (!shouldShow && !isHidden) {

                button.style.display = "none";
            }
        }


        containerEl?.addEventListener("scroll", showMoveToBottomButton, { passive: true })

        return () => {
            observer.disconnect();
            containerEl?.removeEventListener("scroll", showMoveToBottomButton)
        }

    }, [hasScrolled])

    //skeleton loader
    if (!chatInfo) {
        return <ul
            className='flex-1 w-full flex px-2 flex-col overflow-y-auto'
        >
            {Array.from({ length: 15 }).map((_, indx) => (
                <li
                    key={indx}
                    style={{
                        width: `${Math.round(Math.random() * 40)}%`
                    }}
                    className={`h-10 mt-2 bg-white ${indx % 2 == 0 ? 'self-start' : 'self-end'} rounded-lg bg-white/20 animate-pulse `}></li>
            ))}
        </ul>
    }

    //move to bottom
    const moveToBottom = () => {

        const container = containerRef.current;
        if (!container) return;

        container.scroll({
            top: container.scrollHeight,
            behavior: "smooth"
        })
    }

    //retry sending from localStorage
    const retrySending = (message: LocalStorageMessage) => {

        if (!socket || !message.text) return;

        setRetryingMessageId(message.localId);

        try {
            // Emit the message to the server

            socket.emit("sendMessage", {
                text: message.text,
                photo: message.photo || null,
                chatId,
                senderId: userId,
                localId: message.localId
            });


            setTimeout(() => {
                setRetryingMessageId((current) => {
                    if (current === message.localId) {
                        return null;
                    }
                    return current;
                });
            }, 2000)

        } catch (error) {
            console.log("Error while sendind message")
        }
    }

    //sending seen message acknowledgement
    useEffect(() => {

        if (!socket || !chatInfo) return;

        const oberserver = new IntersectionObserver((entries) => {

            const visibleMessageIds = entries
                .filter(entry => entry.isIntersecting)
                .map(entry => entry.target.getAttribute('data-id'));

            const seenMessages = visibleMessageIds.filter(Boolean) as string[];
            const newSeenMessages =seenMessages.filter((messageId)=> !newlySeenMessageRefs.current.includes(messageId))
            newlySeenMessageRefs.current = [...newlySeenMessageRefs.current, ...newSeenMessages];

            if (newSeenMessages.length > 0) {
                socket.emit("messageAcknowledge", {
                    messageIds: newSeenMessages,
                    chatId,
                    userId,
                    acknowledge: "READ"
                })

                //updating store
                removeMessage({chatId,messageIds:newSeenMessages})
            }
        }, {
            root: containerRef.current,
            threshold: 0.6,
        });

        Object.entries(seenMessageRefs.current).forEach(([id, el]) => {

            if (el) {
                el.setAttribute('data-id', id);
                oberserver.observe(el);
            }
        });

        return () => oberserver.disconnect();
    }, [socket, chatInfo])

    return (
        <div

            className='relative h-dvh overflow-y-auto flex-1 text-white pb-20 md:pb-10'>

            <ul
                ref={containerRef}
                className='flex max-h-full overflow-y-auto flex-col-reverse gap-1 w-full px-3 py-2 max-md:pb-8'>
                {(chatInfo && chatInfo.messages?.length > 0) && (
                    <>
                        {/* Local storage messages */}
                        {
                            localMessageContext?.messages?.map((message) => (
                                <li
                                    key={message.localId} className='relative self-end justify-end bg-gray-700 flex-row  px-2 py-1 rounded-lg  max-w-[60%] flex gap-1 items-end'>
                                    <button disabled={retryingMessageId === message.localId} onClick={() => retrySending(message)} className={`absolute -left-5 cursor-pointer hover-black ${retryingMessageId === message.localId ? 'animate-spin duration-300' : ''}`}><CiRedo size={20} /></button>
                                    <span className={`${message.senderId !== userId ? '' : ''}  rounded-lg w-full break-words`}>{message.text}</span>
                                    <span className='text-[10px] text-gray-400'><CiClock2 /></span>
                                </li>
                            ))
                        }

                        {/* server messages */}
                        {
                            chatInfo.messages.map((message) => (

                                <li
                                    ref={(el) => { (message.sender.id !== userId && message.status !== "READ") ? seenMessageRefs.current[message.id] = el : null }}
                                    key={message.id} className={`${message.sender?.id !== userId ? 'self-start justify-start bg-white/20' : 'self-end justify-end bg-gray-700 '} flex-row  px-2 py-1 rounded-lg  max-w-[60%] bg-black flex gap-1 items-end`}>
                                    <span className={`${message.sender?.id !== userId ? '' : ''}  rounded-lg w-full break-words`}>{message.text}</span>
                                    <span className='text-[10px] flex gap-1 flex-row'>
                                        <span className=' text-gray-400'>{getTimeForMessage({ date: message.createdAt })}</span>
                                        <span>{message.sender?.id === userId && <MessageStatus status={message.status} />}</span>
                                    </span>
                                </li>
                            ))
                        }


                        {/* SPinner */}

                        <div ref={topRef} className=" w-full h-10 flex flex-row justify-center items-end pt-10 overflow-hidden" >
                            <ClipLoader
                                loading={isLoading}
                                color='white'
                            />
                        </div>
                    </>
                )
                }
            </ul>



            <button
                style={{ display: "none" }}
                ref={moveTOBottomRef}
                onClick={moveToBottom}
                className='absolute bottom-19 text-white left-1/2 -translate-x-1/2  flex-row items-end justify-center  rounded-full bg-white/40 hover-black cursor-pointer'>
                <GoChevronDown className='up-down-animate' size={40} />
            </button>
        </div>
    )
}

export default ChatBox