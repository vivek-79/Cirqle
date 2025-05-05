"use client"

import store from '@/store/store'
import React from 'react'
import { Provider } from 'react-redux'
import SideNav from '../SideNav'



const RootUserProvider = () => {
  return (
    <Provider store={store}>
        <SideNav/>
    </Provider>
  )
}

export default RootUserProvider