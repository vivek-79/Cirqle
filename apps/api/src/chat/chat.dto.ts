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
    text!:string;
    chatId!:string;
    senderId!:number
}