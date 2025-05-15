import { Controller, Get, Body, Param, Query, ParseIntPipe, UseGuards, Put, Post, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/user.middleware';
import { Reaction_Type } from './dto';

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
}
