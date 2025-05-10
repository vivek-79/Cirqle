
import { AccessToken, api } from '@/constants'
import { User } from '@/types'
import axios from 'axios'
import React, { useState } from 'react'
import HighlightedBackground from '../HighlightedBackground'
import { toast } from 'sonner'
import { useStoredUser } from '@/hooks/store.actions'
import { sendFriendRequest } from '@/helpers/followerFlowHandler'



const SearchComp = () => {

    const [searchedUsers, setSearchedUsers] = useState<User[]>([])

    //getting user from custom hook
    const user = useStoredUser();

    //searching users
    const onSearch = async (name: string) => {

        if (name.length > 0) {
            const foundPersons = await axios.get(`${api}/user/search/${name}`, { withCredentials: true });
            setSearchedUsers(foundPersons.data || [])
        }

    }



    //sending request to user
    const AddFriend = async (receiverId: number) => {

        if (!user.id || !user.accessToken) return;
        const { message, status } = await sendFriendRequest({ senderId: user.id, receiverId, accessToken: user.accessToken })

        if (status) {
            toast.success(message)
        }
        else {
            toast.error(message)
        }
    }


    return (

        <div className='w-full h-full'>
            <h2 className='text-2xl font-bold ml-2'>Search</h2>

            <input type="text" onChange={(e) => onSearch(e.target.value)} placeholder='Search' className='ml-[3%] bg-white/40 h-10 mt-10 rounded-md w-[90%]  outline-none px-2 ' />

            <hr className='w-full mt-4 text-gray-600' />

            {searchedUsers.length > 0 && (
                <div className='flex flex-col gap-2 pt-4 pr-2'>
                    {searchedUsers.map((user) => (
                        <div key={user.id} className='flex flex-row items-center h-11'>
                            <span className='h-19'>
                                <HighlightedBackground scale={0.6} img={user.avatar || "/person.webp"} />
                            </span>
                            <div className='flex flex-col items-start justify-center w-full -ml-1 text-sm'>
                                <span className=' font-medium'>{user.name}</span>
                                <span className='text-xs text-gray-300'>_dji.hgd</span>
                            </div>
                            <button onClick={() => AddFriend(user.id)} className='text-xs text-blue-500 cursor-pointer hover-black'>follow</button>
                        </div>
                    ))}
                </div>
            )}
        </div>

    )
}

export default SearchComp;