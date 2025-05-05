import { OmitType, PartialType } from "@nestjs/mapped-types";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

enum Gender {
    Male,
    Female
}

export class CreateUserDto{


    @IsString()
    name!:string

    @IsEmail()
    email!:string

    @IsString()
    password!:string
}


export class UpdateUserDto extends PartialType(CreateUserDto){

    @IsOptional()
    @IsString()
    bio?:string | null;
    
    @IsOptional()
    @IsString()
    avatar?:string |null;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsBoolean()
    suggestions?:boolean
}

export class UserDto extends CreateUserDto {

    @IsNumber()
    @Transform(({value})=>Number(value),{toClassOnly:true})
    id!:number;

    @IsOptional()
    @IsUrl()
    avatar?: string | null;

    @IsOptional()
    @IsString()
    bio?: string | null;
}

export class UserLogin extends OmitType(CreateUserDto,["name"]){}


export class GoogleUser{
    @IsString()
    name!: string

    @IsEmail()
    email!: string

    @IsString()
    @IsOptional()
    avatar?: string
}


