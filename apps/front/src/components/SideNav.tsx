
"use client"
import React, { useEffect, useRef, useState } from 'react'
import { api } from '@/constants'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Provider, useDispatch } from 'react-redux'
import { login } from '@/store/auth.slice'
import store from '@/store/store'
import axios from 'axios'
import { User } from '@/types'
import { toast } from 'sonner'
import { Riple } from "react-loading-indicators"
import { SideNavComps } from './SideNavButtons'



//used in layouts/RootUserProvider
const SideNav = () => {


    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [currentVisibleComp, setCurrentVisibleComp] = useState<string>("Search")
    const searchRef = useRef<HTMLDivElement>(null);
    const openDrawer = useRef<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const dispatch = useDispatch();




    //getting user and storing in redux
    const { data: session, status } = useSession();

    const user = session?.user as User
    //Authenticate user
    useEffect(() => {

        if (status === "loading") {
            setLoading(true)
            return;
        }

        if (status === "unauthenticated") {
            router.push("/signin")
        }
        // fetch user

        const fetchUserAndInitSocket = async () => {
            try {
                const res = await axios.get(`${api}/auth/${user.id}`)

                if (!res.data) {
                    toast.error("Error getting User")
                    return;
                }
                dispatch(login({ ...res.data, accessToken: user.accessToken }));

            } catch (error) {
                toast.error("Error getting User")
            }
            finally{
                setLoading(false)
            }
        }

        fetchUserAndInitSocket();
    }, [router, session?.user, status, dispatch]);



    if (loading) {
        return <div className='fixed inset-0 flex items-center justify-center'>
            <Riple color="#fdfdfd" size="medium" text="" textColor="" />
        </div>
    }


    return (
        <div className='fixed max-md:bottom-0 md:h-full md:relative shadow-lg  min-w-18 max-md:w-full shadow-white/30 flex flex-row border-r-1 line bg-black z-50'>
            <div className='w-full '>

                <div className='w-full h-28 max-md:hidden block'></div>
                <ul className='w-full px-4 md:h-full  flex md:flex-col max-md:justify-between flex-row gap-7 max-md:border-t-1 max-md:border-gray-500 max-md:py-2'>
                    
                    <Provider store={store}>

                    {SideNavComps.map((Item,indx) => (
                        <li key={indx} className={` ${!Item.smallScreen  && 'max-md:hidden'} flex items-center`}>
                            {Item.comp}
                        </li>
                    ))}
                    </Provider>
                </ul>
            </div>
        </div>
    )
}

export default SideNav