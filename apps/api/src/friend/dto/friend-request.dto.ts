import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class FriendRequestDto{
    
    @IsInt()
    @IsNotEmpty()
    @Transform(({value})=>parseInt(value,10))
    senderId!:number

    @IsInt()
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value,10))
    receiverId!:number
}

export class RemoveFriendDto{

    @IsNumber()
    @Transform(({value})=>Number(value),{toClassOnly:true})
    senderId!:number

    @IsNumber()
    @Transform(({ value }) => Number(value), { toClassOnly: true })
    receiverId!:number
}

export class FRIEND_WITH_NO_CHAT{

    @IsNumber()
    @Transform(({value})=>Number(value))
    id!:number

    @IsOptional()
    @IsString()
    name?:string
}