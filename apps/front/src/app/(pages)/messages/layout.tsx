

import StoreProviderWrapper from '@/components/Store-layouts/StoreProviderWrapper'
import React, { ReactNode } from 'react'
import LayoutComp from './LayoutComp'
import WebSocketProvider from '@/context/WebSockectComp'



const MessageLayout = ({ children }: { children: ReactNode }) => {
    return (
        <section className='w-full h-full'>

            <StoreProviderWrapper>
                <WebSocketProvider>
                    <LayoutComp>
                        {children}
                    </LayoutComp>
                </WebSocketProvider>
            </StoreProviderWrapper>
        </section>
    )
}

export default MessageLayout