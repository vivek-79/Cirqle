

import { listenTOQueue,publishMessage } from "@repo/redis"
import { PrismaClient } from "@repo/db"

type MESSAGE_DTO = {
    text?: string,
    photo?: string,
    chatId: string,
    senderId: number,
    localId: number
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
            const res = await prisma.message.create({
                data: {
                    text: msg?.text,
                    photo: msg?.photo,
                    chatId: msg.chatId,
                    senderId: msg.senderId,
                    status:"SENT"
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
                    status:true,
                    sender: {
                        select: {
                            name: true,
                            avatar: true,
                            id: true,
                        }
                    },
                    seenBy: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    }

                },
            })

            const modifiedData = {
                id: res.chatId,
                members: res.chat.members,
                messages: {
                    id: res.id,
                    text: res.text,
                    photo: res.photo,
                    createdAt: res.createdAt,
                    updatedAt: res.updatedAt,
                    seenBy: res.seenBy,
                    sender: res.sender,
                    status: res.status,
                    localId: msg.localId
                }
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