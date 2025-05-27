import { Injectable, Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ACKNOWLEDGE, ACKNOWLEDGE_TO_USER, REACTION_NOTIFICATION, SEND_MESSAGE } from "./chat.dto";
import { verify } from 'jsonwebtoken';
import { rpushMessage } from '@repo/redis'
import { redis } from "src/lib/redisSetup";
import { ChatService } from "./chat.service";
import { MessagesService } from "src/messages/messages.service";
import { OnEvent } from "@nestjs/event-emitter";
import { PROCESSED_MESSAGE } from "@repo/dto"
import { NOTIFICATION } from "@repo/dto"


@Injectable()
@WebSocketGateway(8081, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {

  constructor(private readonly chatService: ChatService,private readonly messageService:MessagesService) { }
  private readonly logger = new Logger(ChatGateway.name)

  @WebSocketServer()
  io: Server;

  afterInit(server: any) {
    this.logger.log("initialized")
  }

  async handleConnection(client: Socket) {

    const token = client.handshake.auth?.token

    if (!token) {
      this.logger.error('No token provided');
      client.disconnect(); // prevent connection if unauthenticated
      return;
    }
    try {

      
      const secret = process.env.ACCESS_TOKEN_SECRET!
      const user = verify(token, secret) as { email: string, id: number };
      client.data.userId = user.id;

      await redis.set(`socket:${user.id}`, client.id);
      console.log("user Connected",user.id)
    } catch (error) {
      this.logger.error(error);
      client.disconnect();
    }
  }


  async handleDisconnect(client: Socket) {

    const userId = client.data.userId;

    if (userId) {
      await redis.del(`socket:${userId}`);
      this.logger.log(`Disconnected and removed socket for user ${userId}`)
    }
  }

  @SubscribeMessage("sendMessage")
  async handleMessage(client: any, data: SEND_MESSAGE) {

    console.log("this chatgateway here=>",data.messageId)
    await rpushMessage("message", JSON.stringify(data))
  }

  @SubscribeMessage("messageAcknowledge")
  async handleAcknowledge(client: any, data: ACKNOWLEDGE) {
    this.logger.log(`Acknowledge receiver from:${JSON.stringify(data)}`);

    await this.messageService.acknowledgeMessages(data)
  }

  //get request for undelivered messages
  @SubscribeMessage("getUndeliveredMessagesCount")
  async getUnseenMessageCount(client:any,data:{userId:number}){

    const res = await this.messageService.getUndeliveredMessage(data.userId)

    const socketId = client.id;
    this.io.to(socketId).emit("undeliveredMessagesCount",res)
  }

  //get request for unseen messages
  @SubscribeMessage("getUnseenMessages")
  async getUnseenMessage(client:any,data:{userId:number}){

    const res = await this.messageService.getUnseenMessage(data.userId)

    const socketId = client.id;
    this.io.to(socketId).emit("UnseenMessages",res)
  }

  // Acknowledge message to user
  @OnEvent("message.acknowledge", { async: true })
  async handleAcknowledgement(data: ACKNOWLEDGE_TO_USER) {

    await Promise.all((data.messageIds.map(async(message)=>{

      const socketId = await redis.get(`socket:${message.senderId}`) as string

      if(!socketId){
        this.logger.warn(`User ${message.senderId} is not connected. Skipping emit Acknowledge.`);
        return;
      }

      this.io.to(socketId).emit("messageAcknowledgement",{

        messageIds: data.messageIds.map((message)=>message.id),
        chatId: data.chatId,
        acknowledge: data.acknowledge,
      })
    })))
  }

  //sending message reaction
  @OnEvent("reactionNotification", { async: true })
  async handleReactionNotification(data: REACTION_NOTIFICATION){

    await Promise.all((data.members.map(async(member)=>{

      const socketId = await redis.get(`socket:${member.id}`) as string;

      if(!socketId) return;

      this.io.to(socketId).emit("reactionNotification", data.data);

    })))
  }
  //sending message reaction
  @OnEvent("sendMedia", { async: true })
  async handleMedia(data: PROCESSED_MESSAGE){

    await Promise.all((data.members.map(async (member) => {

      const socketId = await redis.get(`socket:${member.id}`) as string

      if (!socketId) {
        this.logger.warn(`User ${member.id} is  not connected. Skipping emit.`);
      }
      this.io.to(socketId).emit("message", data)

    })))
  }

  //sending each notification
  @OnEvent('sendNotification',{async:true})
  async sendNotification(data:NOTIFICATION){
    
    console.log("Notification=>",data)
    const socketId = await redis.get(`socket:${data[0].receiverId}`) as string;

    if(!socketId){
      this.logger.warn(`User ${data[0].receiverId} is not connected. Skipping Notification`)
    }

    this.io.to(socketId).emit("notification",data[0]);
  }

  // Send message to user
  async sendMessageBackToUser(message: PROCESSED_MESSAGE) {

    await Promise.all((message.members.map(async (member) => {

      const socketId = await redis.get(`socket:${member.id}`) as string

      if (!socketId) {
        this.logger.warn(`User ${member.id} is  not connected. Skipping emit.`);
      }
      this.io.to(socketId).emit("message", message)

    })))
  }


  // Message Delivered Acknowledgement
  async messageDeliveredAcknowledgement(messageIds: string[], chatId: string,senderId?: number) {

    if (!senderId) {
      this.logger.error("Sender ID is required for message acknowledgement");
      return;
    };

    const socketId = await redis.get(`socket:${senderId}`) as string;

    if (!socketId) {
      this.logger.warn(`User ${senderId} is not connected. Skipping emit Acknowledge.`);
      return;
    }

      this.io.to(socketId).emit("messageAcknowledgement",{
        messageIds,
        chatId,
        acknowledge:"DELIVERED",
      })
  }
}