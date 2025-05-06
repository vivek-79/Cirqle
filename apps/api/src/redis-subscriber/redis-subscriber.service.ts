import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChatGateway } from 'src/chat/chat.gateway';
import { subscribeChannel } from "@repo/redis"
import { PROCESSED_MESSAGE } from 'src/chat/chat.dto';

@Injectable()
export class RedisSubscriberService implements OnModuleInit {

    constructor(private readonly gateway: ChatGateway) { }

    async onModuleInit() {
        console.log("RedisSubscriberService starting subscription...");
        await this.listenToWorkerMessages();
        console.log("RedisSubscriberService is now listening.");
    }


    async listenToWorkerMessages() {

        await subscribeChannel("newMessage", async (message) => {

            const parsed = JSON.parse(message) as PROCESSED_MESSAGE;

            console.log("message from subscribe =>")
            console.dir(parsed, { depth: null })
            await this.gateway.sendMessageBackToUser(parsed);
        })
    }
}
