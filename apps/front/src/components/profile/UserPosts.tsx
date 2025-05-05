import { AccessToken, api } from '@/constants'
import { useStoredUser } from '@/hooks/store.actions'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FaHeart } from "react-icons/fa";
import { FaComment } from "react-icons/fa6";
import { CloudImage } from '@/app/helpers/getFullImageUrl'

type UserPostsType = {
    id:number;
    thumbnail:string;
    _count:{
        comments:number,
        likes:number,
    }
}

const UserPosts = () => {

    const [userPosts, setUserPosts] = useState<UserPostsType[]>([])

    // Getting user from custom hook
    const user = useStoredUser()

    //fetching User posts
    useEffect(()=>{
        if(user?.accessToken){
            const fetchUserPosts= async()=>{

                try {
                    const res = await axios.get(`${api}/post/user/${user.id}`,
                        {
                            headers: AccessToken(user.accessToken)
                        }
                    )

                    setUserPosts(res.data)
                } catch (error) {
                    toast.error("Error while getting posts")
                }
            }

            fetchUserPosts();
        }
    },[user])

  return (
    <div className='grid grid-cols-3 gap-1'>
        {userPosts && userPosts.map((post)=>(
            <div key={post.id} className='relative h-[40vw] max-h-[400px] group '>
                <Image width={200} height={200} src={ CloudImage(post?.thumbnail)} alt='Posts' className='w-full h-full object-cover object-center'/>
                <div className='absolute flex items-center justify-center inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/60'>
                    <p className='w-full flex flex-row items-center justify-center gap-10 max-sm:gap-6'>
                        <span className='flex flex-row items-center gap-1'><FaHeart size={20}/><span>{post._count.likes}</span></span>
                        <span className='flex flex-row items-center gap-1'><FaComment size={20} /><span>{post._count.comments}</span></span>
                    </p>
                </div>
            </div>
        ))}
    </div>
  )
}

export default UserPosts