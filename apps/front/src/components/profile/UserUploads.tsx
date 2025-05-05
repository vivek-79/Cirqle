
"use client"
import React, { ReactNode, useState } from 'react'
import { IoMdGrid } from "react-icons/io";
import { CiBookmark } from "react-icons/ci";
import { MdOutlinePersonPin } from "react-icons/md";
import StoreProvider from '../Store-layouts/StoreProvider.layout';
import UserPosts from './UserPosts';
import UserSavedPosts from './UserSavedPosts';
import UserTaggedPosts from './UserTaggedPosts';


const UserUploads = () => {

    const componentMap = {
        posts: <UserPosts />,
        bookmarks: <UserSavedPosts />,
        tagged: <UserTaggedPosts />,
    }

    const [selectedTab, setSelectedTab] = useState<keyof typeof componentMap>('posts');


    const clicked = (element: string) => {
        switch (element) {
            case "bookmarks":

                setSelectedTab("bookmarks")
                break;
            case "tagged":

                setSelectedTab("tagged")
                break;

            default:
                setSelectedTab("posts")
                break;
        }
    }
    return (
        <div className='w-full'>
            <div className='w-full max-md:border-y-1 md:border-t-1 line flex flex-row items-center justify-around md:justify-center gap-10 py-2 md:py-4'>
                <button onClick={() => clicked("posts")} className={`${selectedTab === "posts" && "text-blue-400 md:text-white "} md:text-gray-500 flex flex-row items-center`}>
                    <IoMdGrid className='max-md:size-8'/>
                    <span className='hidden md:inline text-xs'>POSTS</span>
                </button>
                <button onClick={() => clicked("bookmarks")} className={`${selectedTab === "bookmarks" && "text-blue-400 md:text-white "} md:text-gray-500 flex flex-row items-center`}>
                    <CiBookmark className='max-md:size-8' />
                    <span className='hidden md:inline text-xs'>SAVED</span>
                </button>
                <button onClick={() => clicked("tagged")} className={`${selectedTab === "tagged" && "text-blue-400 md:text-white "} md:text-gray-500 flex flex-row items-center`}>
                    <MdOutlinePersonPin className='max-md:size-8' />
                    <span className='hidden md:inline text-xs'>TAGGED</span>
                </button>
            </div>

            <div className='px-2'>

                <StoreProvider>
                    {componentMap[selectedTab]}
                </StoreProvider>
            </div>

        </div>
    )
}

export default UserUploads