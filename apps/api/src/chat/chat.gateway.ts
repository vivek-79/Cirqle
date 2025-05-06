import { Injectable, Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PROCESSED_MESSAGE, SEND_MESSAGE } from "./chat.dto";
import { verify } from 'jsonwebtoken';
import { rpushMessage } from '@repo/redis'
import { redis } from "src/lib/redisSetup";




@Injectable()
@WebSocketGateway(8081, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {


  private readonly logger = new Logger(ChatGateway.name)

  @WebSocketServer()
  io: Server;

  afterInit(server: any) {
    this.logger.log("initialized")
  }

  async handleConnection(client: Socket,) {

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

      this.logger.log(`Authenticated user and added to redis ${user.id}`);

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
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${data}`);
  
    await rpushMessage("message", JSON.stringify(data))
  }

  async sendMessageBackToUser(message: PROCESSED_MESSAGE) {

    await Promise.all((message.members.map(async (member) => {

      const socketId = await redis.get(`socket:${member.id}`) as string

      if (!socketId) {
        this.logger.warn(`User ${member.id} is  not connected. Skipping emit.`);
      }
      
      console.log("message to subscribe =>")
      console.dir(message,{depth:null})
      this.io.to(socketId).emit("message", message)

    })))
  }
}