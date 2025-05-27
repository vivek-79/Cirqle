

export type NOTIFICATION ={

    id:string;
    createdAt:Date;
    isRead:boolean;
    type: NOTIFICATION_TYPE;
    message:string;
    receiverId:number;
    isOneWayFollow?:boolean;
    sender:{
        id:number;
        name:string;
        avatar:string | null;
    }
};
export type NOTIFICATION_TYPE = "FRIEND_REQUEST" | "COMMENT" | "LIKE" | "FOLLOW";