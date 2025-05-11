import { forwardRef, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { PrismaService } from "src/prisma/prisma.service";
import { CREATE_CHAT } from "./chat.dto";
import { messageStatusUpdater } from "./messageStatusUpdater";


@Injectable()
export class ChatService {
    constructor(
        @Inject(forwardRef(() => ChatGateway))
        private readonly chatGateway: ChatGateway, 
        private readonly prisma: PrismaService) { }

    async getChats(id: number) {

        try {
            const chats = await this.prisma.chat.findMany({
                where: {
                    members: {
                        some: {
                            id: id
                        }
                    }
                },
                select: {
                    id: true,
                    lastMessage: true,
                    lastMessageAt: true,
                    name: true,
                    groupAvatar: true,
                    isGroup: true,
                    members: {
                        select: {
                            id: true,
                            avatar: true,
                            name: true
                        }
                    }
                }
            })

            // Filter out user from member as un-necessary
            if (chats.length > 0) {

                const modifiedChats = chats.map((chat) => {

                    const receiver = chat.members.filter((member) => member.id != id)

                    return {
                        ...chat,
                        members: receiver
                    }
                })

                return modifiedChats;
            }

            return chats;
        } catch (error) {
            return new InternalServerErrorException("Server error")
        }
    }

    async createChat(data: CREATE_CHAT) {

        try {
            const isChatExist = await this.prisma.chat.findFirst({
                where: {
                    AND: [
                        { members: { some: { id: data.senderId } } },
                        { members: { some: { id: data.receiverId } } }
                    ]
                }
            })

            if (isChatExist) {
                return isChatExist
            }


            const newChat = await this.prisma.chat.create({
                data: {
                    members: {
                        connect: [
                            { id: data.senderId },
                            { id: data.receiverId }
                        ]
                    }
                }
            })

            return newChat
        } catch (error) {
            return new InternalServerErrorException("Server error")
        }
    }

    async getChatDetails({ chatId, userId }: { chatId: string, userId: number }) {

        try {

            console.log("fetcher", userId)
            
            // let updatedStatusIds: { id: string; senderId: number }[] = [];
            const chatDetail = await this.prisma.$transaction(async (tx) => {

                // Step 1: Fetch chat with last 20 messages
                const fetchedChat = await tx.chat.findFirst({
                    where: {
                        id: chatId
                    },
                    select: {
                        id: true,
                        isGroup: true,
                        name: true,
                        groupAvatar: true,
                        members: {
                            select: {
                                name: true,
                                avatar: true,
                                id: true,
                            }
                        },
                        messages: {
                            select: {
                                id: true,
                                text: true,
                                photo: true,
                                createdAt: true,
                                updatedAt: true,
                                status: true,
                                statuses: {
                                    select: {
                                        id: true,
                                        status: true,
                                        seenAt: true,
                                        deliveredAt: true,
                                        userId: true
                                    }
                                },
                                sender: {
                                    select: {
                                        name: true,
                                        id: true,
                                        avatar: true
                                    }
                                }
                            },
                            take: 20,
                            orderBy: {
                                createdAt: "desc"
                            }
                        }
                    },
                });
                if (!fetchedChat) {
                    return {
                        fetchedChat: null,
                        toUpdateStatusIds: []
                    };
                }
                const toUpdateStatusIds = await messageStatusUpdater({tx, messages: fetchedChat.messages, members: fetchedChat?.members, acknowledge: "DELIVERED", userId: userId})

                return{
                    fetchedChat,
                    toUpdateStatusIds,
                }
            })

            if (!chatDetail) {
                return null;
            }

            // Step 3: Send ACK to client
            if (chatDetail.toUpdateStatusIds && chatDetail.toUpdateStatusIds.length > 0) {
                await this.chatGateway.messageDeliveredAcknowledgement(
                    chatDetail.toUpdateStatusIds.map(msg => msg.id),
                    chatId,
                    chatDetail.toUpdateStatusIds[0]?.senderId
                );
            }

            return chatDetail.fetchedChat;
            // Step 4: Return chat details
        } catch (error) {

            throw new InternalServerErrorException("Server error")
        }
    }
}


