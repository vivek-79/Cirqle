
import StoreProviderWrapper from '@/components/Store-layouts/StoreProviderWrapper';
import React, { ReactNode } from 'react'
import ActualComp from './ActualComp';



const ProfileEdit =() => {

  
  return (
    <StoreProviderWrapper>
      <ActualComp/>
    </StoreProviderWrapper>
  )
}

export default ProfileEdit;