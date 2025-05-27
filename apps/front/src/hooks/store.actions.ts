import { removeFromReply, closeChatModal, openChatModal } from "@/store/chatList.slice";
import { setModel } from "@/store/Modals.slice";
import { RootState } from "@/store/store";
import { addMessages, markLastmessageSeen, removeMessages, StoreMessage, updateLastMessage } from "@/store/unseenMessage.slice";
import { User } from "@/types";
import { useDispatch, useSelector } from "react-redux";



export const useStoredUser = (): User => useSelector((state: RootState) => state.auth.data) as User

export const useGetUnseenMessageCount = (): number => useSelector((state: RootState) => state.unseenMessages.count);
export const useChatStoredData = () => useSelector((state: RootState) => state.unseenMessages.data);

export const useLastMessage = () => useSelector((state: RootState) => state.unseenMessages.lastMessage)

export const useReplyingMessage = () => useSelector((state: RootState) => state.Replying.data);

export const useChatModel = () => useSelector((state: RootState) => state.Replying.chatModelOpen);

export const useModelName =()=>useSelector((state:RootState)=>state.model.name);

export const useUnseenMessageActions = () => {
    const dispatch = useDispatch();

    const removeMessage = ({ chatId, messageIds }: { chatId: string, messageIds: string[] }): void => {
        dispatch(removeMessages({ chatId, messageIds }))
    }

    const addMessage = ({ chatId, messageIds }: { chatId: string, messageIds: string[] }): void => {

        dispatch(addMessages({ chatId, messageIds }))

    }

    const currentMessage = ({ chatId, message }: { chatId: string, message: StoreMessage }) => {
        dispatch(updateLastMessage({ chatId, message }))
    }

    const markSeenLastMessage = ({ chatId, messageId }: { chatId: string, messageId: string }) => {
        dispatch(markLastmessageSeen({ chatId, messageId }))
    }

    const clearReplyingMessage = () => {
        dispatch(removeFromReply())
    }

    const closeChatsModel = () => {
        dispatch(closeChatModal())
    }
    const openChatsModel = () => {
        dispatch(openChatModal())
    }

    const setModels =(name:string)=>{
        dispatch(setModel({name}))
    }
    return { addMessage, removeMessage, currentMessage, markSeenLastMessage, clearReplyingMessage, closeChatsModel, openChatsModel ,setModels}
}

