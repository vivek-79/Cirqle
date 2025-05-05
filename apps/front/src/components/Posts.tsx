
'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { api } from '@/constants'
import { PostsDto } from '@/dto'
import Image from 'next/image'
import HighlightedBackground from './HighlightedBackground'
import { formatDistanceToNow } from 'date-fns';
import { RxBorderDotted } from "react-icons/rx";
import PostLowerPart from './PostLowerPart'
import { useStoredUser } from '@/hooks/store.actions'
import { toast } from 'sonner'
import { CloudImage } from '@/app/helpers/getFullImageUrl'

const Posts = () => {

    const [page, setPage] = useState<number>(1)
    const [posts, setPosts] = useState<PostsDto[]>([])

    const user = useStoredUser()

    useEffect(() => {

        if (!user?.accessToken ) return;

        try {
            (async () => {
                const { data } = await axios.get(`${api}/post/page/${page}`, { withCredentials: true ,
                    headers:{
                        Authorization: `Bearer ${user?.accessToken}`,
                    }
                });
                setPosts(data)
            })();
        } catch (error) {
            toast.error("Error getting posts")
        }
    }, [user])

 

    //calculating post time

    const timesAgo =(time:string)=>{
        const timesAgo =formatDistanceToNow(new Date(time))
        const about = timesAgo.includes("about")


        if (!about) {
            const formatedNumber = timesAgo.split(" ")[0]
            const formatedSuffix = timesAgo.split(" ")[1].slice(0, 1)
            return formatedNumber + formatedSuffix
        };
 
        const formatedTime= timesAgo.slice(6,-4);
        const formatedNumber = formatedTime.split(" ")[0]
        const formatedSuffix = formatedTime.split(" ")[1].slice(0, 1)
        return formatedNumber + formatedSuffix

    };


    return (
        <div className='w-full h-full font-insta'>

            <div className='mx-auto max-w-sm flex flex-col gap-3 my-4'>
                {posts.map((post,indx) => (
                    <div key={indx} className='w-full h-fit flex flex-col'>
                        {/* top options */}
                        <div className='flex flex-row items-center relative w-full'>
                            {/* author detail */}
                            <div className='h-19'>
                                <HighlightedBackground scale={0.7} img={post?.author?.avatar}/>
                            </div>
                            <div>
                                <p className='text-xs font-bold items-center flex gap-2'>
                                    <span>{post?.author?.name}</span>
                                    <span className='inline text-xl text-gray-400'>·</span>
                                    <span className='text-gray-400'>{timesAgo(post.createdAt)}</span>
                                </p>
                            </div>
                            <button className='absolute right-2 text-2xl text-gray-400'><RxBorderDotted /></button>
                        </div>

                        {/* main content */}
                        <div className='h-[65dvh] rounded-md overflow-hidden'>
                            <Image key={post.thumbnail} src={CloudImage(post.thumbnail)} width={300} height={400} alt={post.thumbnail} className='w-full h-full object-cover object-center' />
                        </div>

                        {/* Post Lower part */}

                        <PostLowerPart id={post?.id} count={post?._count} content={post.thumbnail} author={post?.author}/>

                        <hr className='mt-6 text-gray-700' />
                    </div>
                ))}
            </div>

            <div className='w-full h-24 bg-white'></div>
        </div>
    )
}

export default Posts