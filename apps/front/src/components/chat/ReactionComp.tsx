import { AccessToken, api } from "@/constants";
import { useStoredUser } from "@/hooks/store.actions";
import axios from "axios";
import React, { SetStateAction } from "react"


export type REACTION = {
    id: string
    emoji: string | null,
    userId: number
}




const ReactionComp = ({ messageId, reaction,func }: { messageId: string, reaction: REACTION[] | [] ,func:React.Dispatch<SetStateAction<string| null>>}) => {


    const user = useStoredUser();
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

            const userReaction = reaction.filter((rxs) => rxs.userId === user.id && rxs.emoji===emoji);

            if (userReaction.length === 0) return null;

            return userReaction[0].id;
        }

        console.log(isSameEmoji())
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
                    reaction:emoji
                }
                 let res = await axios.post(`${api}/messages/reaction/add/${messageId}`,data, {
                    headers: AccessToken(user.accessToken),
                    withCredentials: true
                })
            }
        } catch (error) {
            
            console.log("ERROR while reactions",error)
        }
    }

    return (
        <ul
            onClick={handleReaction}
            className=" flex flex-row w-fit bg-white/20 backdrop-blur-md px-2 text-2xl rounded-2xl">
            <li className="reaction-icon">👍</li>
            <li className="reaction-icon">🔥</li>
            <li className="reaction-icon">❤️</li>
            <li className="reaction-icon">😂</li>
            <li className="reaction-icon">😢</li>
        </ul>
    )
}

export default ReactionComp