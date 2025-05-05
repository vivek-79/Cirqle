import { Comment } from "@/dto"
import Image from "next/image";
import React from "react";
import { RxCross1 } from "react-icons/rx";
import PostLowerPart from "./PostLowerPart";
import HighlightedBackground from "./HighlightedBackground";
import { IoIosHeartEmpty } from "react-icons/io";
import Link from "next/link";
type Props = {
    data: Comment[] | undefined;
    content: string ,
    closeCommentBox: React.Dispatch<React.SetStateAction<boolean>>;
    count: {
        likes: number,
        comments: number
    },
    author?: {
        avatar?: string | undefined,
        name: string
    }
}

const CommentBox = ({ data, content,closeCommentBox,count,author }: Props) => {
    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md z-50 ">
            <div className="mx-auto relative h-full w-full flex flex-row">
                {/* hide button */}
                <button className="absolute top-8 right-8 cursor-pointer hover-black" onClick={()=>closeCommentBox(false)}><RxCross1 size={26} /></button>
                
                {/* main content */}
                <div className='h-[65dvh] w-full max-w-[900px] flex flex-row absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-md overflow-hidden bg-black/80'>
                    
                    {/* content */}
                    <div className="w-1/2 h-full rounded-2xl flex items-center">
                        <Image src={content} width={300} height={400} alt={content} className='w-full h-full object-cover object-center' />
                    </div>

                        {/* comments */}

                        {/* comment-top */}
                        {data && (<div className="flex flex-col relative w-1/2 pb-2  gap-2 ">
                            <div className="w-full h-12 px-2 flex flex-row items-center shrink-0 bg-black">
                                <div className="w-14 h-18">
                                    <HighlightedBackground img={author?.avatar} scale={0.5} />
                                </div>
                                <p className="text-xs">{author?.name}</p>
                            </div>

                        {/* all-comments */}
                        <ul className="overflow-y-auto [scrollbar-width:none] px-4 py-0 flex flex-col gap-4">
                            {data.map((comment,i)=>(
                                <li key={i} className="flex flex-row items-start w-full"> 
                                    <div className="flex flex-row items-center w-full gap-2">

                                          {/*comments-user-profile-pic  */}
                                        <Link href="/" className="w-8 h-8 border rounded-full overflow-hidden shrink-0">
                                            <Image src={comment?.author?.avatar || "/person.webp"} width={10} height={10} alt={comment.author?.name || "image"} className='w-full h-full object-cover cursor-pointer object-center' />
                                        </Link>

                                        {/* comment-main-content */}
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs">
                                                <span className="font-bold mr-2">{comment?.author?.name}</span>
                                                <span className="font-sans text-white/80">{comment?.content}</span>
                                            </p>

                                            {/* comment-like */}
                                            <div className="w-full text-xs flex flex-row gap-8 text-gray-500">
                                                <p className="flex items-center gap-1">
                                                    <span>{1}</span><span> like</span>

                                                </p>
                                                <button className="flex items-center hover-white cursor-pointer">
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* like-comment */}
                                    <IoIosHeartEmpty className="cursor-pointer hover-black" size={16}/>
                                </li>
                            ))}
                        </ul>

                            {/* comments-lower */}
                        <div className="w-full bg-black px-2"><PostLowerPart content={content} count={count} showAllComment={false}/></div>
                    </div> ) }

                </div>
            </div>

        </div>
    )
}

export default CommentBox