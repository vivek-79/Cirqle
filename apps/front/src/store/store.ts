
import { configureStore } from "@reduxjs/toolkit"
import authReducer from './auth.slice'
import unseenMessagesReducer from './unseenMessage.slice'
import ReplyingReducer from './chatList.slice'
import ModelReducer from './Modals.slice'

const store = configureStore({
    reducer:{
        auth:authReducer,
        unseenMessages:unseenMessagesReducer,
        Replying: ReplyingReducer,
        model:ModelReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export default store