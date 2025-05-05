
import { IoIosHeartEmpty } from "react-icons/io";
import { FaRegComment } from "react-icons/fa6";
import { RiShareForwardLine } from "react-icons/ri";
import { CiBookmark } from "react-icons/ci";
import { MdOutlineBookmark } from "react-icons/md";
import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/constants";
import { Comment } from "@/dto";
import CommentBox from "./CommentBox";
import { useStoredUser } from "@/hooks/store.actions";

type Props = {
    id?: number,
    content: string
    count: {
        likes: number,
        comments: number
    },
    author?: {
        avatar?: string | undefined,
        name: string
    },
    showAllComment?: boolean
}

const PostLowerPart = ({ id, count, content, author, showAllComment = true }: Props) => {


    const [input, setInput] = useState<string>('');
    const [comments, setComments] = useState<Comment[] | undefined>()
    const [showCommentBox, setShowCommentBox] = useState<boolean>(false);

    const user =useStoredUser()


    useEffect(() => {

        if (input.length === 0) {
            console.log("laura")
        }

    }, [input])


    //getting comments

    const getAllComments = async () => {
        try {
            const comments = await axios.get(`${api}/post/comments/${id}`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,  // Inject the token in the Authorization header
                },
            });
            setComments(comments?.data)

            if (comments.data.length > 0) {
                setShowCommentBox(true)
            }
        } catch (error: any) {
            throw new Error(error)
        }


    }

    return (
        <div className='w-full h-fit text-gray-300'>
            <div className="flex justify-between items-center">
                <div className="mt-2">
                    <div className="flex flex-row gap-3">
                        <button className="hover-black"> <IoIosHeartEmpty size={27} /></button>
                        <button className="hover-black"><FaRegComment size={25} /></button>
                        <button className="hover-black"> <RiShareForwardLine size={26} /></button>

                    </div>
                    <p className="mt-1 text-sm">{count?.likes} likes</p>
                </div>
                <button className="-mt-3 hover-black"> <CiBookmark size={24} /></button>
            </div>

            {/* Comment section */}

            <div className="w-full flex flex-col items-start">
                {(count?.comments > 0 && showAllComment) && <button onClick={getAllComments} className="text-sm text-gray-500 cursor-pointer hover-white">View all {count.comments} comment</button>}
                <div className="mt-1 w-full flex flex-row">
                    <input value={input} onChange={(e) => setInput(e.target.value)} type="text" placeholder="Add a comment..." className="outline-none placeholder:text-gray-500 text-sm flex-1" />
                    {input.length > 0 && <button className="w-18 text-blue-500">post</button>}
                </div>

                {showCommentBox && (
                    <CommentBox content={content} data={comments} closeCommentBox={setShowCommentBox} count={count} author={author} />
                )}
            </div>
        </div>
    )
}

export default PostLowerPart