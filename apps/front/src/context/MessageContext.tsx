
"use client";
import { ReactNode, use, useEffect, useState } from "react";
import { createContext } from "react";



export type LocalStorageMessage = {
    text?: string | null
    photo?: File | null
    chatId: string
    senderId: number,
    localId:number
}
type MessageContextType = {
    messages: LocalStorageMessage[];
    addMessage: (message: LocalStorageMessage) => void;
    clearMessages: (id?:number) => void;
};


export const MessageContext = createContext<MessageContextType | undefined>(undefined);
export const MessageProvider = ({ children }: { children: ReactNode }) => {

    const [localmessages, setLocalMessages] = useState<LocalStorageMessage[]>([]);

    //adding message to local storage
    const addMessage = (message: LocalStorageMessage) => {
        const savedMessages = localStorage.getItem("savedMessages");
        const parsedMessages = savedMessages ? JSON.parse(savedMessages) : [];
        const updatedSavedMessages = [...parsedMessages, message];
        localStorage.setItem("savedMessages", JSON.stringify(updatedSavedMessages));
        setLocalMessages(updatedSavedMessages); 
    };

    //clearing messages from local storage

    const clearMessages = (id?:number) => {
        const savedMessages = localStorage.getItem("savedMessages");
        const parsedMessages = savedMessages ? JSON.parse(savedMessages) : [];
        const updatedSavedMessages = parsedMessages.filter((message:LocalStorageMessage) => message.localId !== id);
        localStorage.setItem("savedMessages", JSON.stringify(updatedSavedMessages));
        setLocalMessages(updatedSavedMessages);
    };


    useEffect(() => {
        const handleStorageChange = () => {
            const savedMessages = localStorage.getItem("savedMessages");
            const parsedMessages = savedMessages ? JSON.parse(savedMessages) : [];
            setLocalMessages(parsedMessages);
        };

        handleStorageChange(); // Call it initially to set the state
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);



    return (
        <MessageContext.Provider value={{ messages: localmessages, addMessage, clearMessages }}>
            {children}
        </MessageContext.Provider>
    )
 }