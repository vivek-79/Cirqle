import { Controller, Post, Body, Get, Param, ParseIntPipe, Query, UseGuards, Req, UnauthorizedException } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CREATE_CHAT } from "./chat.dto";
import { JwtAuthGuard } from "src/user.middleware";
import { Request } from "express";
import { User } from "src/lib/user-Decorator";

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    //getting all chat list
    @Get(':id')
    getChats(@Param('id', ParseIntPipe) id: number,@Req() req: Request) {

        const userId = req.user?.id ;
        if (!userId) throw new UnauthorizedException('No user ID found in token');


        return this.chatService.getChats(id)
    }

    //getting each chat details
    @Get('/details/:id')
    getChatDetails(@Param('id') chatId: string,@User('id',ParseIntPipe) userId:number) {

        return this.chatService.getChatDetails({ chatId ,userId});
    }

    //Adding a mew chat
    @Post('add')
    createChat(@Body() data: CREATE_CHAT) {
        return this.chatService.createChat(data);
    }
}