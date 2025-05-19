

export interface CHAT_MEMBERS {
    id: number
    name: string
    avatar: string | null
}


export type MESSAGE = {
    text: string | null
    photo: string | null
    createdAt: Date
    updatedAt: Date
    id: string
    sender: CHAT_MEMBERS
    localId?: number
    seenBy: CHAT_MEMBERS[]
    status: "DELIVERED" | "READ" | "SENT",
    replyTo?: {
        id: string;
        text: string | null;
        photo: string | null;
    };
    reactions: {
        emoji: string,
        id: string,
        userId: number
    }[],
    statuses: {
        id: number
        status: string
        seenAt: Date | null
        deliveredAt: Date | null
        userId: number
    }[]
}
export interface PROCESSED_MESSAGE {
    id: string
    members: CHAT_MEMBERS[]

    messages: MESSAGE[]
}
