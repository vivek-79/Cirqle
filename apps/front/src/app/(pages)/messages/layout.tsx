

import StoreProviderWrapper from '@/components/Store-layouts/StoreProviderWrapper'
import React, { ReactNode } from 'react'
import LayoutComp from './LayoutComp'



const MessageLayout = ({ children }: { children: ReactNode }) => {
    return (
        <section className='w-full h-full'>
            <StoreProviderWrapper>
                <LayoutComp>
                    {children}
                </LayoutComp>
            </StoreProviderWrapper>
        </section>
    )
}

export default MessageLayout