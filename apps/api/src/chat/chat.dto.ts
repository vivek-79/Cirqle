import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";



export class CREATE_CHAT{

    @IsNumber()
    @Transform(({value})=>Number(value))
    receiverId!:number;

    @IsNumber()
    @Transform(({ value }) => Number(value))
    senderId!:number;
}

export class SEND_MESSAGE{
    text?:string | null;
    photo?:string | null;
    chatId:string;
    senderId:number;
    localId:number
}

export class CHAT_MEMBERS{
    id:number
    name:string
    avatar?:string | null
}


export class MESSAGE{
    text?: string | null
    photo?: string | null
    createdAt: Date    
    updatedAt: Date
    id: string
    sender: CHAT_MEMBERS
    localId?: number
    status: "DELIVERED" | "READ" | "SENT"
    statuses?: {
        id: number
        status: string
        seenAt: Date | null
        deliveredAt: Date | null
        userId: number
    }[]
}
export class PROCESSED_MESSAGE{
    id:string
    members:CHAT_MEMBERS[]

    messages: MESSAGE
}


export class ACKNOWLEDGE_DATA{
    id:string
    members:CHAT_MEMBERS[]
    messages:MESSAGE[]
}
export type ACKNOWLEDGE = {
    messageIds: string[]
    chatId: string
    userId: number,
    acknowledge: "DELIVERED" | "READ"
}

export type ACKNOWLEDGE_TO_USER={
    messageIds:{
        id:string
        senderId:number
    }[],
    acknowledge:"DELIVERED" | "READ"|"SENT"
    chatId:string
}