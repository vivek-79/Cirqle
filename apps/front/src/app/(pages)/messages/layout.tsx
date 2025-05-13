

import React, { ReactNode } from 'react'
import LayoutComp from './LayoutComp'
import { MessageProvider } from '@/context/MessageContext'
import StoreProviderWrapper from '@/components/Store-layouts/StoreProviderWrapper'



const MessageLayout = ({ children }: { children: ReactNode }) => {



    return (
        <section className='w-full h-full'>

            <StoreProviderWrapper>
                <MessageProvider>
                    <LayoutComp>
                        {children}
                    </LayoutComp>
                </MessageProvider>
            </StoreProviderWrapper>

        </section>
    )
}

export default MessageLayout