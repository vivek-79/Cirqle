"use client"

import React, { ReactNode, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { AccessToken, api } from '@/constants'
import { useLastMessage, useStoredUser, useUnseenMessageActions } from '@/hooks/store.actions'
import { SiGodaddy } from "react-icons/si";
import AddNewChatModal from '@/components/chat/AddNewChatModal'
import { Chat } from '@/types'
import Image from 'next/image'
import { CloudImage } from '@/helpers/getFullImageUrl'
import { useRouter } from 'next/navigation'
import { StoreMessage } from '@/store/unseenMessage.slice'

const LayoutComp = ({ children }: { children: ReactNode }) => {

    const [chatList, setChatList] = useState<Chat[]>([]);
    const [showAddChatModal, setShowAddChatModal] = useState<boolean>(false)
    const user = useStoredUser();
    const openModal = useRef<HTMLDivElement>(null);
    const router = useRouter()
    const lastmessages = useLastMessage();
    const { currentMessage } = useUnseenMessageActions()

    //Fetching chat list
    useEffect(() => {

        if (!user) return;
        (async () => {

            const chats = await axios.get(`${api}/chat/${user.id}`, {
                headers: AccessToken(user.accessToken),
                withCredentials: true
            })
            setChatList(chats.data)

            if (chats.data.length > 0) {
                chats.data.map((dta: { id: string, lastMessage: StoreMessage }) => (
                    currentMessage({ chatId: dta.id, message: dta.lastMessage })
                ))
            }
        })()

    }, [user])

    //closing new chat modal
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openModal.current && !openModal.current.contains(event.target as Node)) {
                setShowAddChatModal(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup when component unmounts
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showAddChatModal]);

    if (!user) {
        return;
    }

    return (
        <section className='w-full h-full flex flex-row'>

            {/* Add new chat Modal */}
            {showAddChatModal && (
                <div className='fixed inset-0 bg-black/50 z-50' >
                    <div ref={openModal}>
                        <AddNewChatModal onPress={setShowAddChatModal} />
                    </div>
                </div>
            )}

            {/* User list */}
            <div className='h-full w-25 md:w-[250px] line border-r-1 flex flex-col pt-10'>
                <div className='flex h-10 flex-row justify-between w-full max-md:justify-center md:px-2 items-center'>
                    <p className='hidden md:block font-bold text-lg'>{user.name}</p>
                    <button onClick={(e) => setShowAddChatModal((prev) => !prev)}><SiGodaddy size={22} /></button>
                </div>
                <div className='flex flex-row items-center justify-between px-4 pt-4'>
                    <button className='text-sm font-bold'>Messages</button>
                    <button className='text-sm font-bold hidden md:block'>Requests</button>
                </div>

                {/* SHOWING CHAT LIST */}
                {chatList.length > 0 && (
                    <div className='flex flex-col'>
                        {chatList.map((chat) => (

                            // Setting chat id on Click
                            <button onClick={() => {
                                router.push(`/messages/${chat.id}`)
                            }} key={chat.id} className='w-full h-12 flex flex-row items-center gap-2 px-4 pt-4 max-md:justify-center cursor-pointer'>

                                <Image src={
                                    chat.groupAvatar ? CloudImage(chat.groupAvatar) : chat.members?.[0]?.avatar ? CloudImage(chat.members[0].avatar) : "/person.webp"
                                }
                                    width={9}
                                    height={9}
                                    alt='User pic'
                                    className='w-10 h-10 rounded-full object-center object-cover flex-shrink-0'
                                />

                                <span className='flex flex-col items-start'>
                                    <span className=' font-semibold hidden md:block'>
                                        {chat.name || chat.members?.[0].name}
                                    </span>

                                    {/* NEW MESSAGE INDICATOR */}
                                    <span className='text-xs font-semibold'>
                                        {lastmessages[chat?.id] && (
                                            <>
                                                <span className={`max-md:hidden ${lastmessages[chat?.id].seen ? 'text-gray-400' : 'text-white'}`}>{lastmessages?.[chat.id]?.text}</span>
                                                
                                                {/* SMALL SCREEN MESSAGE INDICATOR */}
                                                {!lastmessages[chat?.id].seen && (
                                                    <span className='md:hidden block min-w-[10px] min-h-[10px] rounded-full bg-white'></span>
                                                )}
                                            </>
                                        )}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat box */}
            <div className='flex-1 overflow-x-hidden '>
                {children}
            </div>
        </section>
    )
}

export default LayoutComp