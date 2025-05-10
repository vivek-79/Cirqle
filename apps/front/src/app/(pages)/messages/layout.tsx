

import StoreProviderWrapper from '@/components/Store-layouts/StoreProviderWrapper'
import React, { ReactNode, useContext } from 'react'
import LayoutComp from './LayoutComp'
import WebSocketProvider from '@/context/WebSockectComp'
import { MessageProvider } from '@/context/MessageContext'



const MessageLayout = ({ children }: { children: ReactNode }) => {


   
    return (
        <section className='w-full h-full'>

            <StoreProviderWrapper>
                <MessageProvider>
                    <WebSocketProvider>
                        <LayoutComp>
                            {children}
                        </LayoutComp>
                    </WebSocketProvider>
                </MessageProvider>
            </StoreProviderWrapper>
        </section>
    )
}

export default MessageLayout