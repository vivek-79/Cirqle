import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { redis } from 'src/lib/redisSetup';
import { NOTIFICATION } from "@repo/dto";
import { EventEmitter2 } from '@nestjs/event-emitter'
import { isOneWayFollowCheck } from 'src/lib/isOneWayFollow';

@Injectable()
export class NotificationService {

  constructor(private readonly prisma: PrismaService, private readonly emiter: EventEmitter2) { }

  //get notifications
  async getNotifications(id: number) {


    try {

      //Cached notification
      // const cached = await redis.lrange(`${id}-notifications`,0,-1);

      // if (cached && cached.length>0) {
      //   return cached;
      // }

      const notifications = await this.prisma.notification.findMany({
        where: {
          receiverId: id,
        },
        select: {
          id: true,
          message: true,
          isRead: true,
          createdAt: true,
          type: true,
          receiverId: true,
          sender: {
            select: {
              avatar: true,
              name: true,
              id: true
            }
          }
        }
      });

      if (notifications.length == 0) {
        return []
      }

      // Processing if notification type is follow
      const modifiedNotifications = await isOneWayFollowCheck(notifications);

      //Caching notifications and sending 

      // const serialized = modifiedNotifications.map(n=>JSON.stringify(n))
      // await redis.lpush(`${id}-notifications`,...serialized);
      // await redis.ltrim(`${id}-notifications`,0,49);

      return modifiedNotifications;

    } catch (error) {
      throw new InternalServerErrorException("Error while getting notifications")
    }
  }

  //sending individual nootification
  async sendNotification(notification: NOTIFICATION) {

    try {

      // if its a follow notification
      if (notification.type === "FOLLOW") {

        const modifiedNotification = await isOneWayFollowCheck([notification]);

        redis.lpush(`${notification.receiverId}-notifications`, JSON.stringify(modifiedNotification));

        this.emiter.emit('sendNotification', modifiedNotification);

        return;
      };

      redis.lpush(`${notification.receiverId}-notifications`, JSON.stringify(notification));
      this.emiter.emit('sendNotification', notification);

    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  //marking notifications seen
  async markRead(notificationIds: string[]) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds,
          }
        },
        data: {
          isRead: true
        }
      })

      return { ok:true,message:'Notifications updated successfully' }
    } catch (error) {
      return { ok: false, message: 'Error while updating notifications' }
    }
  }
}
