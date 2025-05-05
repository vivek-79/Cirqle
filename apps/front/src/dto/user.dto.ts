import { OmitType, PartialType } from "@nestjs/mapped-types";
import { Transform } from "class-transformer";
import { IsEmail, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";


export type CreateUserDto ={

    name:string

    email:string

    password?:string
}


export type UpdateUserDto ={

    avatar?:string;
    bio?:string ;
}

// export class UserDto extends CreateUserDto {

//     @IsNumber()
//     @Transform(({value})=>Number(value),{toClassOnly:true})
//     id:number;

//     @IsOptional()
//     @IsUrl()
//     avatar?: string | null;

//     @IsOptional()
//     @IsString()
//     bio?: string | null;
// }

// export class UserLogin extends OmitType(CreateUserDto,["name"]){}