import { CloudImage } from '@/app/helpers/getFullImageUrl';
import Image from 'next/image';
import React from 'react'
import { GoInfo } from "react-icons/go";

type Props = {
    avatar?:string | null;
    isOnline?:boolean;
    lastOnline?:string;
    name:string | null
}

const ChatBoxHeader = ({avatar,isOnline,lastOnline,name}: Props) => {
  return (
      <div className=' px-4 min-h-16 w-full flex items-center justify-center border-b-1 line z-50 bg-black'>
        <div className='h-full w-full flex flex-row items-center justify-between '>
            <button className='w-full flex flex-row items-center gap-2'>
                  <Image
                      src={CloudImage(avatar) || "/person.webp"}
                      height={10}
                      width={10}
                      alt={name || "user pic"}
                      className='w-10 h-10 rounded-full '
                  />
                  <span className='flex flex-col items-start'>
                      <span className='text-lg font-semibold'>{name || 'New Chat'}</span>
                      <span className='text-xs text-gray-500'>Active 2h ago</span>
                  </span>
            </button>
            <button
            className='title:bg-black'
            title='Chat Info'
            >
                <GoInfo size={24}/>
            </button>
        </div>
    </div>
  )
}

export default ChatBoxHeader