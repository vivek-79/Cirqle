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
    senderId:number
}

export class CHAT_MEMBERS{
    id:number
    name:string
    avatar?:string | null
}
export class PROCESSED_MESSAGE{
    id:string
    members:CHAT_MEMBERS[]

    messages:{

        text?:string | null
        photo?:string | null
        createdAt:string
        updatedAt:string
        id:string
        seenBy:CHAT_MEMBERS[]
        sender: CHAT_MEMBERS
    }
}
