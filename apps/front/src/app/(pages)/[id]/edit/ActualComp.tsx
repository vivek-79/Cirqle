
"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image';
import { AccessToken, api } from '@/constants';
import { useStoredUser } from '@/hooks/store.actions';
import axios from 'axios';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { login } from '@/store/auth.slice';
import { CloudImage } from '@/helpers/getFullImageUrl';
import { UserProfile, UserUpdate } from '@/types';
import Suggestions from '@/components/Suggestions';


const ActualComp = () => {

    const [avatarUpdateLoading, setAvatarUpdateLoading] = useState<boolean>(false);
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);
    const [user, setUser] = useState<UserProfile>()
    const dispatch = useDispatch();
    const storedUser = useStoredUser();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { register, handleSubmit, setValue } = useForm({
        defaultValues: {
            bio: "",
            gender: "",
            Suggestions: false
        }
    })


    //getting user profile
    useEffect(() => {

        if (!storedUser) return;
        try {
            (async () => {
                const res = await axios.get(`${api}/user/${storedUser?.id}`, {
                    headers: AccessToken(storedUser.accessToken)
                })

                setUser(res.data);
                setValue("bio", res?.data?.bio)
                setValue("gender", res?.data?.gender)
                setShowSuggestion(res?.data?.suggestions)
            })()
        } catch (error) {
            toast.error("Error while getting profile")
        }
    }, [storedUser])

    const [showSugesstions, setShowSuggestion] = useState<boolean>(user?.suggestions || true);


    //Avatar update
    const Upload = async (file: File) => {

        console.log("file selected")
        if (!file || !storedUser.accessToken) {
            return;
        }

        //loading true
        setAvatarUpdateLoading(true);

        const formData = new FormData();
        formData.append('new_avatar', file);

        if (storedUser.avatar) {
            formData.append('avatar', storedUser.avatar)
        }
        try {
            const res = await axios.put(`${api}/user/${storedUser.id}`, formData, {

                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: AccessToken(storedUser.accessToken).Authorization
                }
            });

            if (!res.status) {
                toast.error(res.data?.message)
            }

            //dispatch user with new profile
            dispatch(login(res.data.user))

            // resetting input field
            if (fileInputRef.current) {

                fileInputRef.current.value = "";
            }
        } catch (error) {

            toast.error("Error while Uploding Image")
        }
        finally {
            setAvatarUpdateLoading(false)
        }
    }

    //Other info updates

    const onSubmit = async (data: UserUpdate) => {

        if (
            user?.bio === data.bio &&
            user?.gender === data.gender &&
            user?.suggestions === showSugesstions
        ) {
            return;
        }
        setUpdateLoading(true)
        data.suggestions = showSugesstions;

        try {
            await axios.put(`${api}/user/${storedUser.id}`, data, {
                headers: AccessToken(storedUser.accessToken)
            })
        } catch (error) {
            toast.error("Error while saving changes")
        }
        finally {
            setUpdateLoading(false)
        }
    }

    return (
        <section className='w-full max-w-sm md:max-w-md mx-auto h-full pt-8 max-md:px-4 '>
            <h3 className='text-2xl font-bold'>Edit profile</h3>

            <div className='flex flex-row my-8 items-center justify-between bg-white/20 px-2 py-2 rounded-2xl'>
                <Image src={CloudImage(user?.avatar)} priority width={48} height={48} alt='profile pic' className='w-18 h-18 rounded-full' />
                <p className='flex flex-col'>
                    <span className='font-bold'>its_Vivek_15</span>
                    <span className='text-gray-500'>Vivek</span>
                </p>
                {/* upload pic */}
                <div>
                    <label
                        htmlFor='avatar'
                        className='bg-blue-400 px-2 py-1 rounded-lg cursor-pointer flex '
                    >
                        {avatarUpdateLoading ?
                            <div className='flex flex-row gap-1 w-full h-full'>

                                <span className='flex gap-1'>Uploading</span>
                                <span className=' px-2.5  border-dotted border-2 rounded-full duration-300 animate-spin'></span>
                            </div>
                            : "Change photo"
                        }
                    </label>
                    <input type="file"
                        ref={fileInputRef}
                        id='avatar' onChange={(e) => {
                            console.log("selected")
                            console.log(e.target.files?.[0])
                            const file = e.target.files?.[0];
                            if (file) Upload(file)
                        }} className="hidden" />
                </div>
            </div>

            {/* Details form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className='w-full flex flex-col'>

                <label htmlFor="bio" className='mb-4 font-bold'>Bio</label>
                <textarea {...register("bio")} rows={3} maxLength={150} name="bio" id="bio" className='border-1 border-gray-600 w-full rounded-lg outline-none p-2 overflow-y-auto' />

                <label htmlFor="gender" className='mb-4 font-bold pt-8 pb-4'>Gender</label>
                <select
                    {...register("gender")}
                    name="gender" id="gender" className='border-1 border-gray-600 w-full rounded-lg outline-none p-3 bg-black'>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="empty">Prefer not to say</option>
                </select>

                <label htmlFor="type" className='mb-4 font-bold pt-8 pb-4'>Show account suggestions on profiles</label>
                <div className='border-1 border-gray-600 w-full rounded-lg outline-none p-3 bg-black flex flex-row items-center justify-between'>
                    <p className='w-[80%]'>
                        <span>
                            Show account suggestions
                        </span>
                        <br />
                        <span className='text-sm text-gray-500'>
                            Choose whether people can see similar account suggestions on your profile.
                        </span>
                    </p>
                    <button onClick={() => setShowSuggestion((prev) => !prev)} type='button' className={`w-11 relative h-6 rounded-2xl flex flex-row items-center transition-colors duration-500 ${showSugesstions ? "bg-white" : "bg-black border-1 border-gray-600"}`}>
                        <span
                            className={`
                            absolute top-0 left-0
                            w-6 h-6 rounded-full
                            transition-all duration-500 transform
                            ${showSugesstions ? "translate-x-5 bg-black" : "translate-x-0 bg-white"}
                            `}
                        />
                    </button>
                </div>

                <button
                    type='submit'
                    className='w-full py-1 text-center bg-blue-700 mt-4 rounded-lg'
                >
                    {updateLoading ? <div className='flex flex-row gap-1 w-full h-full justify-center'>

                        <span className='flex gap-1'>Uploading</span>
                        <span className=' px-2.5  border-dotted border-2 rounded-full duration-300 animate-spin'></span>
                    </div>
                        : "Save Changes"}
                </button>
            </form>
        </section>
    )
}

export default ActualComp;