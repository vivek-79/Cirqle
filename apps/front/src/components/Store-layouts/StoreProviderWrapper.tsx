
"use client"

import React, { ReactNode } from 'react'
import StoreProvider from './StoreProvider.layout'

const StoreProviderWrapper = ({children}:{children:ReactNode}) => {
  return (
    <StoreProvider>
        {children}
    </StoreProvider>
  )
}

export default StoreProviderWrapper