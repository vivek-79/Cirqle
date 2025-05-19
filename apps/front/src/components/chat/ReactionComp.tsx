import { AccessToken, api } from "@/constants";
import { useStoredUser } from "@/hooks/store.actions";
import { addToReply } from "@/store/chatList.slice";
import axios from "axios";
import React, { MouseEvent, SetStateAction } from "react"
import { BsReply } from "react-icons/bs";
import { useDispatch } from "react-redux";


export type REACTION = {
    id: string
    emoji: string | null,
    userId: number
}




const ReactionComp = ({ messageId, reaction, func ,photo,text}
    : 
    {photo:string | null,text:string | null, messageId:string, reaction: REACTION[] | [], func: React.Dispatch<SetStateAction<string | null>> }) => {


    const user = useStoredUser();
    const dispatch = useDispatch()
    const handleReaction = async (e: React.MouseEvent<HTMLUListElement>) => {

        if (!user || !user.id) return;

        e.stopPropagation();

        const li = (e.target as HTMLElement).closest("li");

        if (!li) {
            return;
        }

        func(null);

        const emoji = li.innerHTML;

        //checking is reacted with same emoji
        const isSameEmoji = () => {

            if (reaction.length === 0) return null;

            const userReaction = reaction.filter((rxs) => rxs.userId === user.id && rxs.emoji === emoji);

            if (userReaction.length === 0) return null;

            return userReaction[0].id;
        }

        try {
            if (isSameEmoji()) {
                const data = {
                    userId: user.id,
                    reactionId: isSameEmoji(),
                }
                await axios.delete(`${api}/messages/reaction/remove/${messageId}`, {
                    params: data,
                    headers: AccessToken(user.accessToken),
                    withCredentials: true
                })
            }

            else {

                //getting emojiId
                const emojiId = reaction.filter((rxs) => rxs.userId === user.id)[0]?.id;

                const data = {
                    userId: user.id,
                    reactionId: emojiId,
                    reaction: emoji
                }
                let res = await axios.post(`${api}/messages/reaction/add/${messageId}`, data, {
                    headers: AccessToken(user.accessToken),
                    withCredentials: true
                })
            }
        } catch (error) {

            console.log("ERROR while reactions", error)
        }
    }

    //setting store for reply
    const handleReply =(e:MouseEvent<HTMLButtonElement>)=>{
        e.stopPropagation()
        func(null)
        dispatch(addToReply({messageId,text,photo}));
    }

    return (
        <div className=" flex flex-col w-fit h-fit bg-white/20 backdrop-blur-md py-1  rounded-2xl">
            <ul
                onClick={handleReaction}
                className="flex flex-row text-2xl px-2"
            >
                <li className="reaction-icon">👍</li>
                <li className="reaction-icon">🔥</li>
                <li className="reaction-icon">❤️</li>
                <li className="reaction-icon">😂</li>
                <li className="reaction-icon">😢</li>
            </ul>
            <hr className="text-gray-500 mt-1" />
            <button 
            onClick={handleReply}
            className=" w-full cursor-pointer rounded-xl px-4 hover:text-gray-400  flex flex-row items-center gap-2">
                <BsReply className="text-lg" />
                Reply
            </button>
        </div>
    )
}

export default ReactionComp