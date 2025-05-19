import { Controller, Get, Body, Param, Query, ParseIntPipe, UseGuards, Put, Post, Delete, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/user.middleware';
import { Reaction_Type, SEND_FILE } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageType } from 'src/lib/image-upload';
import { Request } from 'express';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  
  //fetching previous messages
  @Get(':id')
  find(@Param('id') chatId:string,@Query('page',ParseIntPipe) page:number) {
    return this.messagesService.find({chatId,page});
  }

  @Post('/reaction/add/:id')
  addReaction(@Param('id') messageId: string, @Body() data:Reaction_Type){

    const { userId, reaction, reactionId } = data;
    return this.messagesService.handleReaction({messageId,userId,reaction,reactionType:"ADD",reactionId})
  }
  @Delete('/reaction/remove/:id')
  removeReaction(@Param('id') messageId: string, @Query() data: Reaction_Type){
    const { userId, reaction,reactionId } = data;
    return this.messagesService.handleReaction({ messageId, userId, reaction, reactionType: "REMOVE", reactionId })
  }

  @Post('/upload/:id')
  @UseInterceptors(FileInterceptor("media"))
  sendMedia(@Param('id') chatId: string, @UploadedFile() file: UploadImageType, @Req() req: Request, @Body() data: SEND_FILE){

    return this.messagesService.handleMedia(file, req, chatId, data)
  }
}
