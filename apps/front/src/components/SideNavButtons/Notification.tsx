
"use client"

import React, { useRef } from 'react'
import SideNavButton from './Button'
import { IoIosHeartEmpty } from "react-icons/io";
import NotificationComp from '../LeftSlider/Notification';
import { useModelName, useUnseenMessageActions } from '@/hooks/store.actions';
import { useClickOutSide } from '@/hooks/useClickOutside';


const Notification = () => {

  const notificationRef = useRef<HTMLDivElement>(null);
  const modelName = useModelName();
  const { setModels } = useUnseenMessageActions();
  const isOpen = modelName === 'notification';

  useClickOutSide({
    ref: notificationRef,
    action: () => {
      if (isOpen) setModels('')
    }
  })



  return (
    <div
      ref={notificationRef}
    >

      <SideNavButton
        Icon={IoIosHeartEmpty}
        size={28}
        content='Notification'
        onPress={() => {
          setModels(isOpen ? '' : 'notification')
        }}
      />

      <div style={{ width: modelName == "notification" ? 310 : 0 }} className='fixed top-0 left-18 xl:left-38 bottom-0 z-50 bg-black overflow-hidden pt-8 transition-all duration-500 shadow-md shadow-white'>
        <NotificationComp />
      </div>
    </div>
  )
}

export default Notification