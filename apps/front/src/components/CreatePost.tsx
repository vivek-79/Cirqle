'use client'

import Image from "next/image";
import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react"
import { IoMdImages } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { BsArrowLeftShort } from "react-icons/bs";
import { useForm } from "react-hook-form";
import axios from "axios";
import { AccessToken, api } from "@/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";




type Props = {
    setShowModal: Dispatch<SetStateAction<boolean>>,
    userId:number,
    accessToken?:string
}

const CreatePost = ({ setShowModal, userId, accessToken }: Props) => {

    console.log(accessToken)
    const [step, setStep] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(null);
    const [post,setPost] = useState<File>()
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const { register,handleSubmit } = useForm();
    const [postLoading,setPostLoading] = useState<boolean>(false)
    const router = useRouter()
    
    const makePost = async(data:any)=>{

        if (!post || !accessToken) return;
        
        setPostLoading(true);

        const formData = new FormData();

        formData.append("title",data.title);
        formData.append("public", isPublic.toString());
        formData.append("content",post);
        formData.append("authorId",userId.toString())

        try {
            const res = await axios.post(`${api}/post`,formData, {
                withCredentials: true,
                headers: AccessToken(accessToken)
            });

            if(res.data.status){
                setShowModal(false)
                router.push(`/${userId}`)
            }
            else{
                toast.error(res.data.message)
            }
        }
        finally{
            setPostLoading(false)
        }

      
    }
    return (
        <div className='relative max-w-md lg:w-md bg-[#262626] backdrop-blur-md rounded-lg flex flex-col items-center justify-center min-h-[300px] xl:translate-x-25 md:translate-x-6'>

            {/* If image selected */}
            {preview && (
                <div className="h-10 w-full flex flex-row justify-between px-2">

                    {/* Prev Button */}
                    <button
                        className="cursor-pointer hover-black text-white"
                        onClick={() => {
                            if (step > 0) {

                                setStep((prev) => prev - 1)
                            }
                            else {
                                setShowModal(false)
                            }
                        }
                        }
                    ><BsArrowLeftShort size={35} /></button>

                    {/* Next Button */}
                    <button
                        className="cursor-pointer hover-black text-blue-500"
                        onClick={() => {setStep((prev)=> prev<1 ? prev+1 : prev)}}
                    >next</button>
                </div>
            )}

            {/* Setp-1 : Select Post */}
            {step === 0 && (
                <div className="flex flex-col items-center justify-center gap-4  w-full h-full">


                    <div className="relative w-full h-full">

                        {preview ? (
                            <div className="w-full h-full relative">
                                <Image src={preview} height={300} width={300} alt="Post pic" className="max-h-[350] w-full object-center object-cover " />
                            </div>
                        ) : (

                            <div className="w-full h-full flex flex-col items-center px-22 justify-center">
                                <IoMdImages size={100} className="text-white/50" />
                                <label
                                    htmlFor='avatar'
                                    className='bg-blue-400 px-2 py-1 rounded-lg cursor-pointer flex '
                                >
                                    {false ?
                                        <div className='flex flex-row gap-1 w-full h-full'>

                                            <span className='flex gap-1'>Uploading</span>
                                            <span className=' px-2.5  border-dotted border-2 rounded-full duration-300 animate-spin'></span>
                                        </div>
                                        : "Select from gallery"
                                    }
                                </label>
                                <input type="file"
                                    ref={fileInputRef}
                                    id='avatar'
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setPost(file)
                                            const url = URL.createObjectURL(file);
                                            setPreview(url); // set preview image
                                        }

                                    }} className="hidden" />
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* Step-2 : Add Infos */}
            {step === 1 && (
                <div className="flex md:w-md flex-row items-center justify-center gap-4  h-full px-2">
                    <div className="w-full h-full relative">
                        {preview && <Image src={preview} height={300} width={300} alt="Post pic" className="h-[350] object-center object-cover rounded-lg" />}
                    </div>

                    <form 
                        onSubmit={handleSubmit(makePost)}
                        className="w-full h-full gap-4">

                        <label htmlFor="title">Title</label>
                        <textarea {...register("title")} rows={3} maxLength={50} name="title" id="title" className='border-1 border-gray-600 w-full rounded-lg outline-none p-2 overflow-y-auto mt-1' />

                        <div className='border-1 border-gray-600 w-full rounded-lg outline-none p-3 flex flex-row items-center justify-between'>
                            <p className='w-[80%]'>
                                <span>
                                    Publish
                                </span>
                            </p>


                            <button onClick={() => setIsPublic((prev) => !prev)} type='button' className={`w-11 relative h-6 rounded-2xl flex flex-row items-center transition-colors duration-500 ${isPublic ? "bg-white" : "bg-black border-1 border-gray-600"}`}>
                                <span
                                    className={`
                            absolute top-0 left-0
                            w-6 h-6 rounded-full
                            transition-all duration-500 transform
                            ${isPublic ? "translate-x-5 bg-black" : "translate-x-0 bg-white"}
                            `}
                                />
                            </button>
                        </div>

                        <button
                            type='submit'
                            className='w-full py-1 text-center bg-blue-700 hover:bg-blue-600 mt-4 rounded-lg cursor-pointer'
                        >
                            {postLoading ? <div className='flex flex-row gap-1 w-full h-full justify-center'>

                                <span className='flex gap-1'>Uploading</span>
                                <span className=' px-2.5  border-dotted border-2 rounded-full duration-300 animate-spin'></span>
                            </div>
                                : "Post"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default CreatePost
