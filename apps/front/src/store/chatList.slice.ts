import { createSlice, PayloadAction } from "@reduxjs/toolkit";



type REPLYING_MESSAGE = {
    data:{
        text: string | null
        photo: string | null
        messageId: string
    } | null,
    chatModelOpen:boolean
} 

const initialState:REPLYING_MESSAGE ={
    data: null,
    chatModelOpen:false
}
const ChatListSlice = createSlice({

    name:"Replying",
    initialState,

    reducers:{
        addToReply: (state, action: PayloadAction<{ text: string | null, photo: string | null,messageId:string}>)=>{

            const {text,photo,messageId} = action.payload;

            state.data ={
                text,
                photo,
                messageId
            }
        },

        removeFromReply:(state)=>{
            state.data = null;
        },

        openChatModal:(state)=>{
            state.chatModelOpen = true;
        },
        closeChatModal:(state)=>{
            state.chatModelOpen = false;
        }
    }
})

export const { addToReply, removeFromReply, closeChatModal, openChatModal } = ChatListSlice.actions;

export default ChatListSlice.reducer