import { forwardRef, Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "../chat/chat.service";
import { ChatController } from "../chat/chat.controller";
import { MessagesModule } from "src/messages/messages.module";



@Module({
    imports: [forwardRef(() => MessagesModule)],
    controllers: [ChatController],
    providers: [ChatGateway, ChatService],
    exports: [ChatGateway, ChatService]
})
export class GateWayModule { }