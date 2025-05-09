"use client"

import { AccessToken, api } from '@/constants'
import { WebSocketContext } from '@/context/WebSockectComp'
import axios from 'axios'
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {ClipLoader} from 'react-spinners'
import { GoChevronDown } from "react-icons/go";
import { newMessageSound } from '@/helpers/sounds'

interface ChatProps {
    chatId?: string | null,
    userId?: number | null,
    accessToken?: string | null

}

export type CHAT_MEMBERS = {
    id: number
    name: string
    avatar?: string | null
}

export type MESSAGE = {
    text?: string | null
    photo?: string | null
    createdAt: string
    updatedAt: string
    id: string
    seenBy: CHAT_MEMBERS[]
    sender: CHAT_MEMBERS
}
export type PROCESSED_MESSAGE = {
    id: string
    members: CHAT_MEMBERS[]

    messages: MESSAGE[]
}

const ChatBox = ({ chatId, userId, accessToken }: ChatProps) => {

    if (!chatId || !userId) {
        return <div>Invalid Chat</div>  // Or a fallback
    }

    const socket = useContext(WebSocketContext);
    const [chatInfo, setChatInfo] = useState<PROCESSED_MESSAGE | null>(null);
    const containerRef = useRef<HTMLUListElement | null>(null)
    const [hasScrolled, setHasScrolled] = useState<boolean>();
    const hasScrollFetchedRef = useRef(false);
    const topRef = useRef<HTMLDivElement>(null);
    const moveTOBottomRef = useRef<HTMLButtonElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const pageRef = useRef(2);



    //fetching previous messages
    useEffect(() => {

        if (!chatId || !accessToken) return;

        (async () => {
            try {

                const res = await axios.get(`${api}/chat/details/${chatId}`, {
                    params: {
                        page: 1
                    },
                    withCredentials: true,
                    headers: AccessToken(accessToken)
                })

                setChatInfo(res?.data)

                //scrolling to bottom on 1st fetch
                setHasScrolled(false);

            } catch (error) {
                toast.error("Error getting messages")
            }
        })()
    }, [chatId])

    //fetching real-time messages
    useEffect(() => {

        if (!socket) return;

        socket.on("message", (data) => {
            console.log("Message received Chat box");
            console.log(data)

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

            //sound of message
            newMessageSound()
        })

        return () => {
            socket.off("connect");
            socket.off("message")
        }
    }, [socket])

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
                   
                    (async()=>{
                        setIsLoading(true);
                        hasScrollFetchedRef.current=true;

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
                            if(res.data && res.data.length>0){

                                setChatInfo((prev)=>{

                                    if(!prev){
                                        return null;
                                    }
                                    return{

                                        ...prev,
                                        messages:[...prev?.messages,...res.data]
                                    }
                                })
                                
                                //increasing page size
                                pageRef.current +=1;
                                hasScrollFetchedRef.current=false;
                                setIsLoading(false);
                            }
                            else{
                            
                                hasScrollFetchedRef.current = true;
                                setIsLoading(false);
                            }


                        } catch (error) {
                            toast.error("Error getting messages")
                            hasScrollFetchedRef.current=false;
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
            const shouldShow =Math.abs(containerEl.scrollTop) > containerEl.clientHeight;
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
    const moveToBottom=()=>{
        
        const container = containerRef.current;
        if(!container) return;

        container.scroll({
            top:container.scrollHeight,
            behavior:"smooth"
        })
    }

    return (
        <div
            
            className='relative h-dvh overflow-y-auto flex-1 text-white pb-20 md:pb-10'>

                <ul
                ref={containerRef}
                className='flex max-h-full overflow-y-auto flex-col-reverse gap-1 w-full px-3 py-2 max-md:pb-8'>
                {(chatInfo && chatInfo.messages?.length > 0) && (
                    <>
                        {
                            chatInfo.messages.map((message, indx) => (
                                
                                <li key={indx} className={`${message.sender.id !== userId ? 'self-start justify-start' : 'self-end justify-end'}  max-w-[60%] bg-black flex flex-row items-center`}>
                                    <span className={`${message.sender.id !== userId ? 'bg-white/20' : 'bg-gray-700'} py-1 px-2 rounded-lg w-full break-words`}>{message.text}</span>
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
                <GoChevronDown className='up-down-animate' size={40}/>
            </button>
        </div>
    )
}

export default ChatBox