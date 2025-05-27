
import { PrismaClient } from "@repo/db";
import { NOTIFICATION } from "@repo/dto"

export const isOneWayFollowCheck = async (notifications: NOTIFICATION[])=>{

    const prisma = new PrismaClient();

    const modifiedNotifications = await Promise.all(
        notifications.map(async (notification) => {

            if (notification.type === "FOLLOW") {

                const isOneWayFollow = await prisma.friendRequests.findFirst({
                    where: {
                        receiverId: notification.receiverId,
                        senderId: notification.sender.id
                    }
                })
                const isUserFollowing = await prisma.follows.findFirst({
                    where: {
                        followerId: notification.receiverId,
                        followingId: notification.sender.id
                    }
                })

                return {
                    ...notification,
                    isOneWayFollow: !!(isOneWayFollow || !isUserFollowing)
                }

            }
        })
    );
    return modifiedNotifications;
}
