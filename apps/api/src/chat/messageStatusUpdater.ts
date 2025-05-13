
import { Prisma } from "@repo/db";

interface AcknowledgeMessagesParams {
    tx: Prisma.TransactionClient;
    messages: {
        id: string;
        status: "SENT" | "DELIVERED" | "READ";
        statuses: {
            userId: number;
            status: "DELIVERED" | "READ" | "SENT";
        }[];
        sender: {
            id: number;
        };
    }[];
    userId: number;
    members: {
        id: number;
    }[];
    acknowledge: "DELIVERED" | "SENT" | "READ";
}
  

export const messageStatusUpdater = async ({
    tx,
    messages,
    members,
    acknowledge,
    userId
}: AcknowledgeMessagesParams): Promise<{ id: string; senderId: number }[]> => {
    try {
        let updatedStatusIds: { id: string; senderId: number }[] = [];

        const toUpdateStatusIds = messages.map((message) => {
            if (message.status === "READ" || message.sender.id === userId) return null;

            const hasReceived = message.statuses.some(s => s.userId === userId);
            const hasSeen = message.statuses.some(s => s.userId === userId && s.status === "READ");

            if ((hasReceived && acknowledge =="DELIVERED") || hasSeen) return null;
            

            const uniqueUserIds=()=>{
                if (acknowledge == "DELIVERED") {
                    return [...new Set(message.statuses.filter(s => s.userId !== userId).map(s => s.userId))];
                }
                if (acknowledge == "READ") {
                    return [...new Set(message.statuses.filter(s => s.userId !== userId && s.status === "DELIVERED").map(s => s.userId))];
                }
            }

            const isLastUserToFetch = uniqueUserIds.length === members.length - 2;

            return {
                messageId: message.id,
                isLastUserToFetch,
            };
        });

        const idsToUpdate = toUpdateStatusIds.filter(Boolean).map(m => m!.messageId);

       
        const isLastUserMessageIds = toUpdateStatusIds
            .filter(m => m?.isLastUserToFetch)
            .map(m => m!.messageId);

        if (idsToUpdate.length === 0 && isLastUserMessageIds.length === 0) {
            return [];
        }
        if (idsToUpdate.length > 0 && acknowledge !== "READ") {
            await tx.messageStatus.createMany({
                data: idsToUpdate.map(id => ({
                    messageId: id,
                    userId,
                    status: acknowledge,
                }))
            });
        }

        if (isLastUserMessageIds.length > 0) {
            const updatedMessages = await tx.message.updateMany({
                where: { id: { in: isLastUserMessageIds } },
                data: { status: acknowledge }
            });

            if (updatedMessages.count > 0) {
                updatedStatusIds = await tx.message.findMany({
                    where: {
                        id: { in: isLastUserMessageIds },
                        status: acknowledge,
                    },
                    select: { id: true, senderId: true },
                    orderBy: { createdAt: "desc" },
                    take: 20,
                });
            }
        }

        return updatedStatusIds;
    } catch (err) {
        console.error("Error updating message status:", err);
        return []; // Always return array
    }
}
