
import { IconType } from "react-icons";
import { CHAT_MEMBERS, MESSAGE } from "./components/chat/ChatBox";
import { PROCESSED_MESSAGE } from "@repo/dto"
import { NOTIFICATION }  from "@repo/dto"
export type SideNav ={
    name:string;
    icon?:IconType;
    size?:number,
    link:boolean,
    large?:boolean
}

export type User={
    avatar?:string;
    email?: string;
    name: string ;
    id:number;
    accessToken?:string;
}

export type UserUpdate={
    bio:string | undefined,
    gender:string | undefined,
    suggestions?:boolean | undefined
}

export type UserProfile = {
    avatar?: string;
    name: string;
    id: number;
    bio:string;
    gender:string;
    suggestions:boolean
}


export type ChatDetails={
    isGroup:boolean,
    groupAvatar:string | null,
    name:string | null,
    members:User[],
    message:[]
}

export  type MESSAGE_ACKNOWLEDGEMENT = {
    messageIds: string[]
    chatId: string
    acknowledge: "DELIVERED" | "READ"
}

export type EACH_PROCESSED_MESSAGE = {
    id: string
    members: CHAT_MEMBERS[]

    messages:MESSAGE
}

export type SEND_ACKNOWLEDGE={
    messageIds: string[]
    chatId: string
    userId: number,
    acknowledge: "DELIVERED" | "READ"
}

export type UNSEEN_MESSAGES={
    id:string,
    chatId:string,
    senderId:number
}

export type REACTION_NOTIFICATION={
    id: string,
    emoji: string ,
    messageId: string,
    userId:number
}
export interface ClientToServerEvents {
    sendMessage: (data: { text: string | null, photo:File | null , chatId: string, senderId:number,localId:number,messageId?:string }) => void;
    messageAcknowledge: (data: SEND_ACKNOWLEDGE)=> void;
    getUndeliveredMessagesCount:(data:{userId:number})=>void;
    getUnseenMessages:(data:{userId:number})=>void;
    // add more if needed
}

export interface ServerToClientEvents {
    message: (data: PROCESSED_MESSAGE) => void;

    messageAcknowledgement: (data: MESSAGE_ACKNOWLEDGEMENT) => void;

    undeliveredMessagesCount: (data: UNSEEN_MESSAGES[]) => void;
    UnseenMessages: (data: UNSEEN_MESSAGES[]) => void;

    reactionNotification: (data: REACTION_NOTIFICATION)=>void;

    notification:(data:NOTIFICATION) => void;
    // add more if needed
}