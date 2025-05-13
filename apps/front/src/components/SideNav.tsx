
"use client"
import React, { useEffect, useRef, useState } from 'react'
import { api, path, sideNav } from '@/constants'
import Link from 'next/link'
import Image from 'next/image'
import LeftSliderComp from './LeftSlider/LeftSlider'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Provider, useDispatch } from 'react-redux'
import { login } from '@/store/auth.slice'
import store from '@/store/store'
import axios from 'axios'
import { User } from '@/types'
import { toast } from 'sonner'
import { Riple } from "react-loading-indicators"
import CreatePost from './CreatePost'
import MessagesButton from './chat/MessagesButton'



//used in layouts/RootUserProvider
const SideNav = () => {


    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [currentVisibleComp, setCurrentVisibleComp] = useState<string>("Search")
    const searchRef = useRef<HTMLDivElement>(null);
    const openDrawer = useRef<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const dispatch = useDispatch();
    const [showCreatePostModal, setShowCreatePostModal] = useState<boolean>(false)



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

    const buttonClicked = (name: string) => {

        if ((!showSearch && !openDrawer.current)) {
            setCurrentVisibleComp(name)
            setShowSearch(true);
            openDrawer.current = true
        }
        else {
            openDrawer.current = false
        }

    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearch(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup when component unmounts
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSearch]);



    if (loading) {
        return <div className='fixed inset-0 flex items-center justify-center'>
            <Riple color="#fdfdfd" size="medium" text="" textColor="" />
        </div>
    }


    return (
        <div className='fixed max-md:bottom-0 md:h-full md:relative shadow-lg  min-w-18 max-md:w-full shadow-white/30 flex flex-row border-r-1 border-gray-600 bg-black z-50'>
            <div className='w-full '>

                <div className='w-full h-28 max-md:hidden block'></div>
                <ul className='w-full px-4 md:h-full  flex md:flex-col max-md:justify-between flex-row gap-7 max-md:border-t-1 max-md:border-gray-500 max-md:py-2'>
                    {sideNav.map((Item) => (
                        <li key={Item.name} className={`${Item.large ? "hidden md:block" : "block"} flex items-center hover-black`}>
                            {Item.link ? (
                                <Link href={Item.name === "Home" ? '/' : Item.name === "Profile" ? '/23' : `${path}/${Item.name.toLowerCase()}`} className='w-full flex flex-row items-center font-semibold'>
                                    {Item?.icon && <Item.icon size={Item?.size} />}
                                    {Item.name === "Messages" && (<MessagesButton />)}
                                    {Item.name === "Profile" && (<span className=' w-7 h-7 border-1 rounded-full overflow-hidden'>
                                        <Image src={"/person.webp"} height={14} width={14} alt='profile-pic' className='w-full h-full object-cover object-center ' />
                                    </span>)}
                                    <span style={{ fontWeight: 400 }} className='hidden xl:block pr-12 pl-2 '>{Item?.name}</span>
                                </Link>
                            ) : (
                                <button onClick={(e) => {
                                    e.stopPropagation()
                                    if (Item.name === "Create") {
                                        setShowCreatePostModal(true)
                                    }
                                    else {

                                        buttonClicked(Item.name);
                                    }

                                }} className='w-full flex flex-row items-center font-semibold'>
                                    {Item?.icon && <Item.icon size={Item?.size} />}
                                    <span style={{ fontWeight: 400 }} className='hidden xl:block pr-12 pl-2 '>{Item?.name}</span>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Slider */}
            <div ref={searchRef} style={{ width: showSearch ? 250 : 0 }} className='fixed top-0 left-18 xl:left-51 bottom-0 z-50 bg-black overflow-hidden pt-8 transition-all duration-500 shadow-md shadow-white'>
                <Provider store={store}>
                    <LeftSliderComp comp={currentVisibleComp} />
                </Provider>
            </div>
            {/* Modal for Create Post */}

            {showCreatePostModal && (
                <div className='fixed inset-0 flex items-center justify-center flex-col'>
                    <CreatePost setShowModal={setShowCreatePostModal} userId={user.id} accessToken={user.accessToken} />
                </div>
            )}
        </div>
    )
}

export default SideNav