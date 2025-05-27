import React from 'react'
import SideNavButton from './Button'
import { PiSignOut } from 'react-icons/pi';
import { signOut } from 'next-auth/react';


const Logout = () => {
    return (
        <SideNavButton Icon={PiSignOut} content='Logout' onPress ={()=>signOut({callbackUrl:'/signin'})}/>
    )
}

export default Logout;