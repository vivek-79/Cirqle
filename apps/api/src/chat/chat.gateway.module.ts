import { forwardRef, Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "../chat/chat.service";
import { ChatController } from "../chat/chat.controller";
import { MessagesModule } from "src/messages/messages.module";
import { NotificationModule } from "src/notification/notification.module";



@Module({
    imports: [forwardRef(() => MessagesModule),NotificationModule],
    controllers: [ChatController],
    providers: [ChatGateway, ChatService],
    exports: [ChatGateway, ChatService]
})
export class GateWayModule { }