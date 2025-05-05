import { CreateUserDto ,UpdateUserDto} from "./user.dto"


export type CreatePostDto ={
  slug:string | null

  title:string

  content:string

  thumbnail?:string | null

  published:boolean

  authorId:number
}


type Author = CreateUserDto & UpdateUserDto
export type PostsDto = {
    id:number;
    author: Author
    thumbnail:string
    title:string,
    createdAt:string,
    _count:{
        likes: number,
        comments:number
    }
}

export type Comment={
    content?:string;
    author?:{
        id:number,
        avatar:string,
        name:string,
    }
}