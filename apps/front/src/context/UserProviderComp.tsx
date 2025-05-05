import StoreProviderWrapper from '@/components/Store-layouts/StoreProviderWrapper'
import React, { ReactNode } from 'react'
import WebSocketProvider from './WebSockectComp'


const UserProviderComp = ({children}:{children:ReactNode}) => {
  return (
    <StoreProviderWrapper>
        <WebSocketProvider>
            {children}
        </WebSocketProvider>
    </StoreProviderWrapper>
  )
}

export default UserProviderComp