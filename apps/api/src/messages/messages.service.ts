import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ACKNOWLEDGE } from 'src/chat/chat.dto';
import { messageStatusUpdater } from 'src/chat/messageStatusUpdater';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { UploadImage, UploadImageType } from 'src/lib/image-upload';
import { Request } from 'express';
import { SEND_FILE } from './dto';

@Injectable()
export class MessagesService {

  constructor(private readonly prisma: PrismaService, private readonly eventEmmiter: EventEmitter2, private readonly config: ConfigService) { }
  async find({ chatId, page }: { chatId: string, page: number }) {

    try {
      const messages = await this.prisma.message.findMany({
        where: {
          chatId: chatId
        },
        skip: (page - 1) * 20,
        take: 20,
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          text: true,
          photo: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          replyTo:{
            select:{
              id:true,
              text:true,
              photo:true
            }
          },
          reactions: {
            select: {
              id: true,
              userId: true,
              emoji: true
            }
          },
          sender: {
            select: {
              name: true,
              id: true,
              avatar: true
            }
          }
        }
      })

      return messages;
    } catch (error) {
      return new InternalServerErrorException("Server error")
    }
  }

  // Acknowledge message
  async acknowledgeMessages(data: ACKNOWLEDGE) {
    try {

      const { messageIds, userId, acknowledge, chatId } = data;


      const toUpdateIds = await this.prisma.$transaction(async (tx) => {

        const messages = await tx.message.findMany({
          where: {
            id: { in: messageIds },
            chatId: chatId
          },

          select: {
            id: true,
            status: true,
            chat: {
              select: {
                members: {
                  select: {
                    id: true
                  }
                }
              }
            },
            sender: {
              select: {
                id: true
              }
            },
            statuses: {
              select: {
                userId: true,
                status: true,
              }
            }
          }
        })

        const toUpdateStatusIds = await messageStatusUpdater({ tx, members: messages[0].chat.members, messages, acknowledge, userId })
        return toUpdateStatusIds
      })

      if (toUpdateIds.length === 0) return;

      this.eventEmmiter.emit("message.acknowledge", {
        messageIds: toUpdateIds,
        chatId,
        acknowledge
      })
    } catch (error) {
      throw new InternalServerErrorException("Server error")
    }
  }

  //undelivered message
  async getUndeliveredMessage(userId: number) {

    const res = await this.prisma.message.findMany({
      where: {
        status: "SENT",
        chat: {
          members: {
            some: { id: userId }
          }
        },
        statuses: {
          none: {
            userId
          }
        },
      },
      select: {
        id: true,
        chatId: true,
        senderId: true
      }
    })

    return res;
  }

  //unseen message
  async getUnseenMessage(userId: number) {

    const res = await this.prisma.message.findMany({
      where: {
        OR: [
          { status: "SENT" },
          { status: "DELIVERED" }
        ],
        chat: {
          members: {
            some: { id: userId }
          }
        },
        statuses: {
          every: {
            OR: [
              { userId: { not: userId } },
              { userId: userId, status: "DELIVERED" }
            ]
          },
        },
      },
      select: {
        id: true,
        chatId: true,
        senderId: true
      }
    })

    return res;
  }

  //reaction
  async handleReaction({ messageId, userId, reactionType, reaction, reactionId }: { messageId: string, userId: number, reactionType: "REMOVE" | "ADD", reaction?: string, reactionId?: string }) {

    console.log(messageId, userId, reactionType, reaction, reactionId)
    let res;
    try {

      if (reactionType === "ADD" && !reactionId && reaction) {
        res = await this.prisma.reaction.create({
          data: {
            userId,
            messageId,
            emoji: reaction,
          }
        })

        console.log("create")
      }

      else if (reactionType === "ADD" && reactionId) {
        res = await this.prisma.reaction.update({
          where: {
            id: reactionId,
          },
          data: {
            emoji: reaction
          }
        })
        console.log("update")
      }
      else if (reactionType === "REMOVE" && reactionId) {
        const result = await this.prisma.reaction.delete({
          where: {
            id: reactionId,
          }
        })

        res = {
          id: result.id,
          messageId: result.messageId,
          userId: result.userId,
          emoji: null
        }
        console.log("remove")
      }

      //sending via websocket
      const data = {
        id: res.id,
        messageId: res.messageId,
        emoji: res.emoji,
        userId: res.userId
      }

      //fetching all user in chat
      const chatMembers = await this.prisma.message.findFirst({
        where: {
          id: messageId
        },
        select: {
          chat: {
            select: {
              members: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      })

      const members = chatMembers?.chat.members;

      this.eventEmmiter.emit("reactionNotification", { members, data })
    }
    catch (error) {
      return new InternalServerErrorException("Server error")
    }
  }

  //media sender
  async handleMedia(file: UploadImageType, req: Request, chatId: string, data: SEND_FILE) {


    try {
      console.log("Came file");
      const userId = req.user?.id;
      const cloudName = this.config.get<string>("CLOUDINARY_CLOUD_NAME");
      const apiKey = this.config.get<string>("CLOUDINARY_API_KEY");
      const apiSecret = this.config.get<string>("CLOUDINARY_API_SECRET");

      if (!cloudName || !apiKey || !apiSecret || !userId || !chatId) {
        console.log("Missing Cloudinary config");
        return {
          message: "Upload failed",
          status: false,
        };
      }

      const envVariable = { cloudName, apiKey, apiSecret }
      const { message, status } = await UploadImage({ file, envVariable });

      if (!status) {
        return {
          message: "Upload image failed",
          status: false,
        };
      }

      const res = await this.prisma.$transaction(async (tx) => {

        const data = await tx.message.create({
          data: {
            photo: message,
            senderId: userId,
            chatId,
            status: "SENT",
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
            id: chatId
          },
          data: {
            lastMessageId: data.id
          }
        });

        return data;
      })

      const modifiedData = {
        id: res.chatId,
        members: res.chat.members,
        messages: [{
          id: res.id,
          text: res.text,
          photo: res.photo,
          createdAt: res.createdAt,
          updatedAt: res.updatedAt,
          status: res.status,
          localId: data.localId,
          sender: res.sender,
          reactions: []
        }]
      }

      //sending back saved and processed message
      this.eventEmmiter.emit("sendMedia",modifiedData)

    } catch (error) {
      return {
        message: "Failed to upload try again",
        status: false
      }
    }

  }
}
