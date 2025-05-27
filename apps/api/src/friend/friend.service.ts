import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FRIEND_WITH_NO_CHAT, FriendRequestDto, RemoveFriendDto } from './dto/friend-request.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class FriendService {

  constructor(private readonly prisma: PrismaService, private readonly notificatioService:NotificationService) { }

  //add friend flow
  async sendRequest(req: FriendRequestDto) {

    const { senderId, receiverId } = req;
    try {

      //checking if already follwing

      const alreadyFollwer = await this.prisma.friendRequests.findFirst({
        where: {
          senderId,
          receiverId
        }
      })

      if (alreadyFollwer) {
        return {
          message: 'You are already folowing',
          status: false
        }
      }

      // Checking is sender is accepting request
      const firstTimeFollow = await this.prisma.friendRequests.findFirst({
        where: {
          receiverId: senderId,
          senderId: receiverId
        }
      })

      const followingAfterUnfollow = await this.prisma.follows.findFirst({
        where: {
          followerId: receiverId,
          followingId: senderId
        }
      })


      let notification;

      //adding in friends list and deleting request
      if (firstTimeFollow || followingAfterUnfollow) {

        const transactionResults = await this.prisma.$transaction ([
           this.prisma.follows.create({
            data: {
              followerId: senderId,
              followingId: receiverId
            }
          }),

           this.prisma.notification.create({
            data: {
              type: "FOLLOW",
              message: 'Started following you.',
              senderId,
              receiverId
            },
            select:{
              id:true,
              type:true,
              message:true,
              createdAt: true,
              isRead: true,
              receiverId: true,
              sender:{
                select:{
                  id:true,
                  name:true,
                  avatar:true
                }
              }
            }
          }),

          //deleting request if first time foolowing
          ...(firstTimeFollow ?[
            this.prisma.friendRequests.delete({
              where: {
                id: firstTimeFollow.id
              }
            })
          ]:[])

        ]);

        notification = transactionResults[1];
        // sending notification to receiver
        if (notification) {
          await this.notificatioService.sendNotification(notification);
        };
        return {
          message: "Added to follwings.",
          status: true
        }
      }

      // if first time following , create request and send notification
      const transactionResults = await this.prisma.$transaction([
         this.prisma.friendRequests.create({
          data: {
            senderId,
            receiverId
          }
        }),
        this.prisma.follows.create({
          data: {
            followerId: senderId,
            followingId: receiverId
          }
        }),

        this.prisma.notification.create({
          data: {
            senderId,
            receiverId,
            message: `Started following you.`,
            type: "FOLLOW"
          },
          select: {
          id: true,
          type: true,
          message: true,
          createdAt:true,
          isRead:true,
          receiverId: true,
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
        })
      ])

      notification = transactionResults[2];
      // sending notification to receiver
      if(notification){
        await this.notificatioService.sendNotification(notification);
      };

      //returning success message
      return {
        message: "Added to followings.",
        status: true
      };

    } catch (error) {
      return {
        message: "Network error try again",
        status: false
      }
    }
  }

  //remove friend
  async removeFriend(req: RemoveFriendDto) {
    try {
      const follow = await this.prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: req.senderId,
            followingId: req.receiverId
          }
        }
      });

      if (!follow) {
        return {
          message: 'User not in your followings.',
          status: false
        };
      }

      await this.prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: req.senderId,
            followingId: req.receiverId
          }
        }
      });

      return {
        message: 'Removed from followings.',
        status: true
      };
    } catch (error) {
      return {
        message: 'Server error. Please try again.',
        status: false
      };
    }
  }
  async findFriendWithNoChat({ id, name }: FRIEND_WITH_NO_CHAT) {

    console.log(name)
    try {

      const friends = await this.prisma.follows.findMany({
        where: {
          followerId: id,
          ...(name && {
            following: {
              name: {
                startsWith: name,
                mode: "insensitive"
              }
            }
          })
        },
        select: {
          following: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },

        },
        take: 10
      })

      if (friends.length === 0) {

        return []
      };
      const searchedResult = friends.map((frnd)=>frnd.following)
      return searchedResult;
    } catch (error) {
      return new InternalServerErrorException("Server error")
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} friend`;
  }

  remove(id: number) {
    return `This action removes a #${id} friend`;
  }
}
