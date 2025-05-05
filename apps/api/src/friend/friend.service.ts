import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FRIEND_WITH_NO_CHAT, FriendRequestDto, RemoveFriendDto } from './dto/friend-request.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@repo/db';

@Injectable()
export class FriendService {

  constructor(private readonly prisma: PrismaService) { }

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



      //adding in friends list and deleting request
      if (firstTimeFollow || followingAfterUnfollow) {

        const transactionOps: Prisma.PrismaPromise<any>[] = [
          this.prisma.follows.create({
            data: {
              followerId: senderId,
              followingId: receiverId
            }
          }),

          this.prisma.notification.create({
            data: {
              type: "FRIEND_REQUEST",
              message: 'Started following you.',
              senderId,
              receiverId
            }
          })

        ];

        //deleting request if first time foolowing
        if (firstTimeFollow) {
          transactionOps.push(this.prisma.friendRequests.delete({
            where: {
              id: firstTimeFollow.id
            }
          }))
        }

        await this.prisma.$transaction(transactionOps);
        return {
          message: "Added to follwings.",
          status: true
        }
      }

      await this.prisma.$transaction([
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
            type: "FRIEND_REQUEST"
          }
        })
      ])

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
  async findFriendWithNoChat({ id,name }: FRIEND_WITH_NO_CHAT) {

    console.log(name)
    try {

      const friends = await this.prisma.follows.findMany({
        where: {
          followerId:id,
          ...(name && {
            following:{
              name:{
                startsWith:name,
                mode:"insensitive"
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

    const friendWithNoChat = await Promise.all(friends.map(async (friend) => {

      const isInChat = await this.prisma.chat.findFirst({

        where: {
          AND: [
            { members: { some: { id: id } } },
            { members: { some: { id: friend.following.id } } }
          ]
        }
      })

      if (!isInChat) return friend.following;
      return null;
    }));

    return friendWithNoChat.filter(Boolean);
  } catch(error) {
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
