
import { IconType } from "react-icons";


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

type Members={

}
export type Chat = {
    id:string,
    name:string | null
    lastMessage:string | null
    lastMessageAt:string
    members:User[]
    isGroup:boolean
    groupAvatar:string | null,
}

export type ChatDetails={
    isGroup:boolean,
    groupAvatar:string | null,
    name:string | null,
    members:User[],
    message:[]
}

export interface ClientToServerEvents {
    sendMessage: (data: { text: string, chatId: string, senderId:number }) => void;
    // add more if needed
}

export interface ServerToClientEvents {
    message: (data: { message: string }) => void;
    // add more if needed
}