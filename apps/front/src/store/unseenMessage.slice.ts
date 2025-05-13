
import { createSlice, PayloadAction } from "@reduxjs/toolkit"


export type StoreMessage={
    text: string | null,
    id: string,
    photo: string | null,
    createdAt:Date,
    seen:boolean
}
interface UnSeenMessageState {
    data: Record<string,string[]>;
    count:number ;
    lastMessage:Record<string,StoreMessage>
}


const initialState: UnSeenMessageState = {

    data: {},
    count: 0,
    lastMessage:{}
}

const unseenMessagesSlice = createSlice({

    name: "unseenMessages",
    initialState,

    reducers: {
        addMessages:(state,action:PayloadAction<{messageIds:string[],chatId:string}>)=>{
            const { messageIds,chatId} = action.payload;

            if(!state.data[chatId]){
                state.data[chatId] = []
            }
            
            messageIds.forEach((id)=>{
                if (!state.data[chatId].includes(id)){
                    state.data[chatId].push(id);
                    state.count +=1
                }
            })
        },
        removeMessages: (state, action:PayloadAction<{chatId: string ,messageIds:string[]}>)=>{
            const {chatId,messageIds} = action.payload;
            
            const existing = state.data[chatId]
            if (existing){
                messageIds.map((msgId)=>{

                    if(state.data[chatId].length==0) return;
                    state.data[chatId].filter((msg)=>msg !==msgId);
                    state.count >0? state.count -=1 : 0;

                })
            }
        },
        updateLastMessage: (state, action: PayloadAction<{ chatId: string, message: StoreMessage }>)=>{

            const {chatId,message} = action.payload;
            state.lastMessage[chatId] =message
        }
    }
})


export const { addMessages, removeMessages ,updateLastMessage} = unseenMessagesSlice.actions;
export default unseenMessagesSlice.reducer;