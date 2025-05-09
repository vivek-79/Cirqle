import { Controller, Post, Body, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CREATE_CHAT } from "./chat.dto";

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    //getting all chat list
    @Get(':id')
    getChats(@Param('id', ParseIntPipe) id: number) {
        return this.chatService.getChats(id)
    }

    //getting each chat details
    @Get('/details/:id')
    getChatDetails(@Param('id') chatId: string) {

        return this.chatService.getChatDetails({ chatId });
    }

    //Adding a mew chat
    @Post('add')
    createChat(@Body() data: CREATE_CHAT) {
        return this.chatService.createChat(data);
    }
}