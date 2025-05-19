
import { configureStore } from "@reduxjs/toolkit"
import authReducer from './auth.slice'
import unseenMessagesReducer from './unseenMessage.slice'
import ReplyingReducer from './chatList.slice'


const store = configureStore({
    reducer:{
        auth:authReducer,
        unseenMessages:unseenMessagesReducer,
        Replying: ReplyingReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export default store