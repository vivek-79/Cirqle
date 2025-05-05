import React from 'react'
import { IoIosSettings } from "react-icons/io";
import { BsThreads } from "react-icons/bs";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import Image from 'next/image';
import UserUploads from '@/components/profile/UserUploads';
import ClientLink from '@/components/ui/link';




interface ProfilePageProps {
    params: {
        id: string;
    };
}

const ProfilePage = async ({ params }:ProfilePageProps ) => {

    const user = await params

    return (
        <section className='w-full h-full '>
            {/* Upper nav for small screen */}
            <div className=' w-full h-11 flex flex-row md:hidden border-b-1 line items-center justify-between px-3 '>
                <button className='cursor-pointer hover-black'><IoIosSettings size={26} /></button>
                <button className='text-sm font-bold flex flex-row items-center cursor-pointer'>its_vivek_15 <span><MdOutlineKeyboardArrowDown size={24} className='text-gray-400' /></span></button>
                <button className='cursor-pointer hover-black'><BsThreads size={26} /></button>
            </div>

            {/* Remaining area */}
            <div className='px-3 pt-16'>

                {/* Upper section */}
                <div className='flex flex-col md:flex-row gap-8'>

                    {/* Image and details */}
                    <div className='relative  w-18 h-18 md:w-35 md:h-35 flex items-center justify-center flex-shrink-0'>
                        {/* <button className='absolute bg-gray-900 w-9 h-10 top-[-10%]'></button> */}
                        <Image src={"/person.webp"} alt='Profile pic' height={100} width={100} className=' object-center object-cover w-full h-full rounded-full' />

                        <div className='absolute left-[120%] -top-5 md:-top-10 flex flex-col md:flex-row w-full min-w-[385px] h-10 items-start md:items-center gap-3'>
                            <div className='text-xl pr-4 flex flex-row items-center gap-2'>
                                <span>its_vivek_15</span>
                                <button className='cursor-pointer hover-black md:absolute md:right-0'><IoIosSettings size={26} /></button>
                            </div>
                            
                            <div className='flex flex-row gap-3'>
                                <ClientLink containerClass='flex-shrink-0 bg-white/20 px-2 py-1 rounded-md font-semibold' navigate={`${user.id}/edit`} content='Edit profile'/>
                                <ClientLink containerClass='flex-shrink-0 bg-white/20 px-2 py-1 rounded-md font-semibold' content='View archieve'/>
                            </div>
                        </div>
                    </div>

                    <div className='w-full h-full md:pt-8 -mt-6 ml-1 md:ml-0'>
                        <p className='hidden flex-row gap-4 -ml-1 md:flex'>
                            <span className='font-semibold'>1 <span className='font-normal text-gray-400'>post</span></span>
                            <span className='font-semibold'>10000 <span className='font-normal text-gray-400'>followers</span></span>
                            <span className='font-semibold'>100 <span className='font-normal text-gray-400'>following</span></span>
                        </p>

                        <p className='flex flex-col pt-3 leading-4 text-sm'>
                            <span className='text-lg font-semibold'>Vivek</span>
                            <span>Gamer</span>
                            <span>Music</span>
                            <span>Dancer</span>
                        </p>
                    </div>
                </div>
                {/* Story section */}

                <div className='w-full flex flex-row gap-3 py-6 md:py-16'>
                    <div className='w-15 h-15 md:w-20 md:h-20 border-1 rounded-full border-gray-400 p-0.5'>
                        <Image src={"/person.webp"} alt='Profile pic' height={100} width={100} className=' object-center object-cover w-full h-full rounded-full' />
                    </div>
                    <div className='w-15 h-15 md:w-20 md:h-20 border-1 rounded-full border-gray-400 p-0.5'>
                        <Image src={"/person.webp"} alt='Profile pic' height={100} width={100} className=' object-center object-cover w-full h-full rounded-full' />
                    </div>
                    <div className='w-15 h-15 md:w-20 md:h-20 border-1 rounded-full border-gray-400 p-0.5'>
                        <Image src={"/person.webp"} alt='Profile pic' height={100} width={100} className=' object-center object-cover w-full h-full rounded-full' />
                    </div>
                </div>
            </div>

            {/* Folower section for small screen */}

            <div className='block md:hidden w-full py-2 border-t-1 px-4 line'>
                <p className='flex flex-row gap-4 justify-evenly'>
                    <span className='font-semibold flex flex-col items-center'>
                        <span>1</span>
                        <span className='font-normal text-gray-400'>post</span>
                    </span>
                    <span className='font-semibold flex flex-col items-center'>
                        <span>1000</span>
                        <span className='font-normal text-gray-400'>followers</span>
                    </span>
                    <span className='font-semibold flex flex-col items-center'>
                        <span>100</span>
                        <span className='font-normal text-gray-400'>following</span>
                    </span>
                </p>
            </div>

            {/* Posts , reels and saved*/}
            <UserUploads/>
        </section>
    )
}

export default ProfilePage;