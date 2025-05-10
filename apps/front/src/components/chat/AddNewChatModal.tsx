import { CloudImage } from '@/helpers/getFullImageUrl';
import { AccessToken, api } from '@/constants';
import { useStoredUser } from '@/hooks/store.actions'
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { SiCaddy } from "react-icons/si";
import { toast } from 'sonner';

type DisplayUsers = {
    id: number,
    avatar?: string | null,
    name: string
}

const AddNewChatModal = () => {

    const user = useStoredUser();
    const [searchedText, setSearchedText] = useState<string>('');
    const [debouncedvalue, setDebouncedValue] = useState<string>('');
    const [displayedUsers, setDisplayedUsers] = useState<DisplayUsers[]>([])
    const [newChat, setNewChat] = useState()


    useEffect(() => {
        if (!user) return;

        //get all followings to add to chatList
        (async () => {
            const res = await axios.get(`${api}/friend/${user.id}`, {
                withCredentials: true,
                headers: AccessToken(user.accessToken)
            });

            setDisplayedUsers(res?.data)
        })()
    }, [])

    //Debouncing logic
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(searchedText)
        }, 500)

        return () => clearTimeout(handler)
    }, [searchedText]);

    //fetching debounced value
    useEffect(() => {
        if (debouncedvalue) {
            (async () => {

                const res = await axios.get(`${api}/friend/search/${user.id}`, {
                    params: {
                        name: debouncedvalue
                    },
                    withCredentials: true,
                    headers: AccessToken(user.accessToken)
                })

                setDisplayedUsers(res?.data)
            })()
        }
    }, [debouncedvalue])


    const createNewChat = async (receiverId: number) => {
        if (!receiverId || !user.id) return;

        try {
            const data = {
                receiverId,
                senderId: user.id
            }
            const res = await axios.post(`${api}/chat/add`, data, {
                withCredentials: true,
                headers: AccessToken(user.accessToken)
            });

            console.log(res.data)
        } catch (error) {
            toast.error("Server error try again.")
        }
    }

    return (
        <div className='modal w-[300px] md:w-[400px] py-2 bg-[#262626] flex flex-col items-center rounded-lg'>
            <p className='text-sm font-bold'>New Message</p>
            <input type="text" onChange={(e) => { setSearchedText(e.target.value) }} placeholder='Search' className=' bg-white/40 h-10 rounded-md w-[90%]  outline-none px-2 mt-1' />

            <hr className='text-gray-500 w-full h-1 mt-2' />

            <div className='w-full h-[250px] text-white overflow-y-auto pb-4'>
                {displayedUsers?.length > 0 && (
                    displayedUsers.map((friend) => (
                        <button onClick={() => createNewChat(friend.id)} key={friend.id} className='w-full h-12 flex flex-row items-center justify-between px-4 pt-4'>
                            <span className='flex flex-row gap-2 items-center'>
                                <Image src={friend.avatar ? CloudImage(friend.avatar) : "/person.webp"}
                                    width={10}
                                    height={10}
                                    alt='User pic'
                                    className='w-10 h-10 rounded-full object-center object-cover'
                                />

                                <span>
                                    {friend.name}
                                </span>
                            </span>

                            <span><SiCaddy size={20} className='cursor-pointer hover-black text-gray-400' /></span>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}

export default AddNewChatModal