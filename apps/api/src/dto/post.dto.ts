import { OmitType, PartialType } from "@nestjs/mapped-types"
import { Transform } from "class-transformer"
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator"





export class CreatePostDto{
 
 @IsOptional()
 @IsString()
  slug!:string | null

 @IsOptional()
 @IsBoolean()
 @Transform(({value})=>Boolean(value),{toClassOnly:true})
  public!:boolean

  @IsString()
  title!:string

 
  published!:boolean

  @IsNumber()
  @Transform(({value})=>Number(value),{toClassOnly:true})
  authorId!:number
}

export class UpdatePostDto extends PartialType(OmitType(CreatePostDto,["authorId"])){}

export class PostDto extends PartialType(OmitType(CreatePostDto, ["authorId"])){
    author!:{
        name:string,
        email:string,
        avatar?:string |null,
        createdAt?:string
    }
 }