import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { redis } from 'src/lib/redisSetup';

@Injectable()
export class NotificationService {

  constructor(private readonly prisma: PrismaService) { }

  //get notifications
  async getNotifications(id: number) {


    try {

      //Cached notifica
      const storedNotifications = await redis.get(`${id}-notifications`);

      if (storedNotifications) {
        return storedNotifications;
      }

      const notifications = await this.prisma.notification.findMany({
        where: {
          receiverId: id,
        },
        select: {
          message: true,
          isRead: true,
          createdAt: true,
          type: true,
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

      // Processing if notification

      const modifiedNotifications = await Promise.all(
        notifications.map(async (notification) => {

          if (notification.type === "FRIEND_REQUEST") {

            const isOneWayFollow = await this.prisma.friendRequests.findFirst({
              where: {
                receiverId: id,
                senderId: notification.sender.id
              }
            })
            const isUserFollowing = await this.prisma.follows.findFirst({
              where: {
                followerId: id,
                followingId: notification.sender.id
              }
            })

            return {
              ...notification,
              isOneWayFollow: !!(isOneWayFollow || !isUserFollowing)
            }

          }
        })
      )

      //Caching notifications and sending 
      await redis.setex(`${id}-notifications`, 300, modifiedNotifications)
      return modifiedNotifications;
    } catch (error) {
      throw new InternalServerErrorException("Error while getting notifications")
    }
  }

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
