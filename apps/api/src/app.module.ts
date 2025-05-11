import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { GateWayModule } from './chat/chat.gateway.module';
import { FriendModule } from './friend/friend.module';
import { NotificationModule } from './notification/notification.module';
import { MessagesModule } from './messages/messages.module';
import { RedisSubscriberModule } from './redis-subscriber/redis-subscriber.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    PostModule,
    GateWayModule,
    FriendModule,
    NotificationModule,
    MessagesModule,
    RedisSubscriberModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
