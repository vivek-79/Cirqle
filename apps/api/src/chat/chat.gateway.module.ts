import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "../chat/chat.service";
import { ChatController } from "../chat/chat.controller";



@Module({
    controllers: [ChatController],
    providers: [ChatGateway, ChatService],
    exports: [ChatGateway]
})
export class GateWayModule { }