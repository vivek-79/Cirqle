

import { listenTOQueue, publishMessage } from "@repo/redis"
import { PrismaClient } from "@repo/db"
import { PROCESSED_MESSAGE } from "@repo/dto"

type MESSAGE_DTO = {
    text?: string,
    photo?: string,
    chatId: string,
    senderId: number,
    localId: number,
    messageId?: string
}

(async () => {

    const prisma = new PrismaClient();
    await prisma.$connect();

    console.log("Listening to messages...");

    //getting message from backend
    await listenTOQueue("message", async (msgStr) => {

        console.log("came to worker", msgStr)
        const msg = JSON.parse(msgStr) as MESSAGE_DTO;

        try {
            const res = await prisma.$transaction(async (tx) => {

                const data = await tx.message.create({
                    data: {
                        text: msg?.text,
                        photo: msg?.photo,
                        chatId: msg.chatId,
                        senderId: msg.senderId,
                        status: "SENT",
                        ...(msg.messageId && {
                            replyToId: msg.messageId
                        })
                    },
                    select: {
                        chat: {
                            select: {
                                members: {
                                    select: {
                                        id: true,
                                        name: true,
                                        avatar: true
                                    }
                                },
                            }
                        },
                        id: true,
                        text: true,
                        photo: true,
                        createdAt: true,
                        updatedAt: true,
                        chatId: true,
                        status: true,
                        replyTo: msg.messageId
                            ? { select: { text: true, photo: true, id: true } }
                            : undefined,
                        sender: {
                            select: {
                                name: true,
                                avatar: true,
                                id: true,
                            }
                        },
                    },
                })

                await tx.chat.update({
                    where: {
                        id: msg.chatId
                    },
                    data: {
                        lastMessageId: data.id
                    }
                })
                return data
            })

            const modifiedData: PROCESSED_MESSAGE = {
                id: res.chatId,
                members: res.chat.members,
                messages: [{
                    id: res.id,
                    text: res.text,
                    photo: res.photo,
                    createdAt: res.createdAt,
                    updatedAt: res.updatedAt,
                    status: res.status,
                    localId: msg.localId,
                    sender: res.sender,
                    seenBy: [],
                    reactions: [],
                    statuses: [],

                    ...((msg.messageId && res.replyTo) && {
                        replyTo: {
                            id: res.replyTo.id,
                            text: res.replyTo.text,
                            photo: res.replyTo.photo
                        }
                    })

                }]
            }



            //sending back saved and processed message
            console.log("published from worker")


            const strData = JSON.stringify(modifiedData);
            await publishMessage("newMessage", strData);
            console.log("sent");
        } catch (err) {
            console.error("Redis publish failed:", err);
        }
    });
})();