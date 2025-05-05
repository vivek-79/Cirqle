"use client"
import React from 'react'
import Status from './Status';
import StoreProvider from './Store-layouts/StoreProvider.layout';
import Posts from './Posts';


const CenterComp = () => {

  return (
    <section className='w-full h-full pt-4'>

      <Status />
      <StoreProvider>
        <Posts />
      </StoreProvider>
    </section>
  )
}

export default CenterComp;