import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ACKNOWLEDGE } from 'src/chat/chat.dto';
import { ac } from '@upstash/redis/zmscore-CjoCv9kz';
import { messageStatusUpdater } from 'src/chat/messageStatusUpdater';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MessagesService {

  constructor(private readonly prisma:PrismaService, private readonly eventEmmiter:EventEmitter2){}
  async find({chatId,page}:{chatId:string,page:number}) {

    try {
      const messages = await this.prisma.message.findMany({
        where:{
          chatId:chatId
        },
        skip:(page-1)*20,
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
          status:true,
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
  async acknowledgeMessages(data:ACKNOWLEDGE){
    try {
      
      const {messageIds,userId,acknowledge,chatId} = data;


      const toUpdateIds = await this.prisma.$transaction(async(tx)=>{

        const messages = await tx.message.findMany({
          where: {
            id: { in: messageIds },
            chatId: chatId
          },

          select: {
            id: true,
            status: true,
            chat:{
              select:{
                members:{
                  select:{
                    id:true
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

        const toUpdateStatusIds = messageStatusUpdater({tx,members:messages[0].chat.members,messages,acknowledge,userId})

        return toUpdateStatusIds
      })

      if(toUpdateIds.length === 0) return;

      this.eventEmmiter.emit("message.acknowledge",{
        messageIds:toUpdateIds,
        chatId,
        acknowledge
      })
    } catch (error) {
      throw new InternalServerErrorException("Server error")
    }
  }
  create(createMessageDto: CreateMessageDto) {
    return 'This action adds a new message';
  }


  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
