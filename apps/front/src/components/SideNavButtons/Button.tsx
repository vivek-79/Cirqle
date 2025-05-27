import React from 'react'
import { IconType } from 'react-icons'

type Props = {
  Icon: IconType,
  onPress?: () => void;
  size?: number;
  content?:string;
  disable?:boolean
}

const SideNavButton = ({ Icon, onPress, size = 26, content ,disable}: Props) => {
  return (
    <button disabled={disable} className='side-nav-btn hover-black' onClick={onPress}>
      <Icon size={size} />
      <span className='hidden xl:block'>{content}</span>
    </button>
  )
}

export default SideNavButton