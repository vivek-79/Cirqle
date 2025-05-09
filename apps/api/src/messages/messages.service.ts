import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessagesService {

  constructor(private readonly prisma:PrismaService){}
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
          seenBy: true,
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
