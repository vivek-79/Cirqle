import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto } from 'src/dto/post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/user.middleware';

@Controller('/post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}


  @Get('page/:page')
  getAllPost(@Param('page',ParseIntPipe) page:number){

    return this.postService.getAllPosts(page)
  }

  
  @Get(':id')
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getPostById(id);
  }



  @Put(':id')
  editPost(@Param('id', ParseIntPipe) id: number , @Body() updatePostDto:UpdatePostDto) {
    return this.postService.updatePost(id,updatePostDto);
  }
  @Get('/comments/:id')
  getComments(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getComments(id);
  }

  @Get('/user/:id')
  getUserPosts(@Param('id',ParseIntPipe) id:number){
    return this.postService.getUserPosts(id)
  }

  @Post()
  @UseInterceptors(FileInterceptor("content"))
  makePost( @UploadedFile() file,@Body() createPost:CreatePostDto){
      return this.postService.makePost(createPost,file)
  }
}
