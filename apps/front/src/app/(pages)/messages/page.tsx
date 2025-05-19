
"use client"
import React from 'react'
import { IoLogoWechat } from 'react-icons/io5'
import ClientButton from '@/components/ui/btn'
import { useUnseenMessageActions } from '@/hooks/store.actions'


const MessagesLayout = () => {

    const { openChatsModel } = useUnseenMessageActions()

    return (
        <section className='w-full h-full'>
            <div className='w-full h-full flex flex-col items-center justify-center'>
                <IoLogoWechat size={120} className='text-gray-300' />
                <p className='text-xl font-medium'>Your messages</p>
                <p className='text-sm text-gray-400'>Send a message to start a chat.</p>
                <ClientButton onPress={() => openChatsModel()} content='Send message' containerClass='bg-blue-500 mt-2 px-2 py-1 text-sm font-medium rounded-md' />
            </div>
        </section>
    )
}

export default MessagesLayout