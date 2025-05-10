import { AccessToken, api } from "@/constants"
import axios from "axios"



interface FOLLOW_REQUEST{
    senderId:number,
    receiverId:number,
    accessToken:string,
    request_type?:string
}


export const sendFriendRequest = async ({ senderId, receiverId, accessToken,request_type }: FOLLOW_REQUEST) => {

    const data = {
        senderId,
        receiverId
    }
    try {

        // If Unfollowing
        if(request_type && request_type === 'UNFOLLOW'){

            const res = await axios.delete(`${api}/friend/remove`, {
                data,
                headers: AccessToken(accessToken),
                withCredentials: true,
            })

            return {
                message: res.data.message,
                status: res.data.status,
            }
        }

        //if following
        const res = await axios.post(`${api}/friend/add`, data, {
            headers: AccessToken(accessToken),
            withCredentials: true,
        })

        return {
            message:res.data.message,
            status:res.data.status,
        }
    } catch (error) {
        return {
            message:"Network error try again",
            status:false
        }
    }

}