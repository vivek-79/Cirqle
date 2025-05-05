import { Injectable, Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SEND_MESSAGE } from "./chat.dto";
import { IO_REDIS } from "../lib/redisIo";
import { verify } from 'jsonwebtoken'




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
      const user = verify(token, secret);
      client.data.user = user;
      this.logger.log(`Authenticated user ${user}`)
    } catch (error) {
      this.logger.error(error);
      client.disconnect();
    }
  }

  @SubscribeMessage("sendMessage")
  async handleMessage(client: any, data: SEND_MESSAGE) {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${data}`);
    IO_REDIS.lPush("message", JSON.stringify(data))

  }
}