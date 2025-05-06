import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { PrismaService } from "src/prisma/prisma.service";
import { CREATE_CHAT } from "./chat.dto";


@Injectable()
export class ChatService {
    constructor(private readonly chatGateway: ChatGateway, private readonly prisma: PrismaService) { }

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
            const chatDetail = await this.prisma.chat.findFirst({
                where: {
                    id: chatId
                },
                select: {
                    id:true,
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
                            seenBy: true,
                            sender:{
                                select:{
                                    name:true,
                                    id:true,
                                    avatar:true
                                }
                            }
                        },
                        take: 20,
                        orderBy: {
                            createdAt: "desc"
                        }
                    }
                },
            })
            
            return chatDetail;
        } catch (error) {

            throw new InternalServerErrorException("Server error")
        }
    }
}


