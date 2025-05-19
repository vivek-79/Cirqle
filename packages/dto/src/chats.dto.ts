import { MESSAGE } from "./messages.dto"


export interface CHAT_MEMBERS{
    avatar:string | null
    id:number
    name:string
}
export interface Last_MESSAGE{
    id:string
    createdAt:Date
    photo:string | null
    text:string | null
    seen:boolean
}
export type USER_CHATS ={

    id:string
    name:string | null
    groupAvatar:string | null
    isGroup:boolean
    lastMessage:Last_MESSAGE | null
    members: CHAT_MEMBERS[]
}

export type CHAT_DETAILS = USER_CHATS &{
    messages:MESSAGE[];
}