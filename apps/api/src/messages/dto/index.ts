import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class Reaction_Type{

    @IsString()
    @IsOptional()
    reaction?:string

    @IsNumber()
    @Transform(({value})=>Number(value))
    userId:number

    @IsOptional()
    @IsString()
    reactionId?:string
}
