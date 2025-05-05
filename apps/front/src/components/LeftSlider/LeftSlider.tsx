
import React, { JSX, ReactNode, useEffect } from 'react'
import SearchComp from './SearchComp';
import Notification from './Notification';





const LeftSliderComp = ({ comp }: { comp: string }): JSX.Element | null => {

  switch (comp) {
    case "Search":
      return <SearchComp />
    case "Notifications":
      return <Notification />
    default:
      return null;
  }
}

export default LeftSliderComp