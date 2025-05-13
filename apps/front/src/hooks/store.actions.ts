import { RootState } from "@/store/store";
import { addMessages, removeMessages, StoreMessage, updateLastMessage } from "@/store/unseenMessage.slice";
import { User } from "@/types";
import { useDispatch, useSelector } from "react-redux";



export const useStoredUser = (): User => useSelector((state: RootState) => state.auth.data) as User

export const useGetUnseenMessageCount = (): number => useSelector((state: RootState) => state.unseenMessages.count);
export const useChatStoredData = () => useSelector((state: RootState) => state.unseenMessages.data);

export const useLastMessage =()=> useSelector((state:RootState)=>state.unseenMessages.lastMessage)

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


    return { addMessage, removeMessage, currentMessage }
}

