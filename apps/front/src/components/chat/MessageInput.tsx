
'use client'
import { MessageContext } from '@/context/MessageContext';
// import { WebSocketContext } from '@/lib/socket';
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CiFaceSmile } from "react-icons/ci";
import { CiImageOn } from "react-icons/ci";
import { CiHeart } from "react-icons/ci";
import { IoIosSend } from "react-icons/io";
import { localStorageMessage } from './ChatBox';
import { useSocket } from '@/hooks/webSocket';


const MessageInput = ({ chatId, userId }: { chatId: string, userId: number }) => {


    //getting messages context
    const localMessageContext = useContext(MessageContext);

    const socket = useSocket()
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [sendButtonVisible, setSendButtonVisible] = useState<boolean>(false)

    //showing send button when there is a message
    const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to content height
        }
        if (textarea?.value && textarea.value.trim().length > 0) {
            setSendButtonVisible(true)
        }
        else {
            setSendButtonVisible(false)
        }
    };

    //sending message to the server
    const handleSendMessage = useCallback(() => {

        if (!socket || !textareaRef.current?.value) return;

        const value = textareaRef.current.value;
        textareaRef.current.value = ""; // Clear the textarea

        try {

            //saving message to local storage

            const localId = Date.now();

            if (localMessageContext) {

                localMessageContext.addMessage({
                    text: value,
                    chatId,
                    senderId: userId,
                    localId,
                });
            }


            // Emit the message to the server

            socket.emit("sendMessage", {
                text: value,
                photo: null,
                chatId,
                senderId: userId,
                localId,
            });

            console.log("sent")

            handleInput();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }, [socket, chatId, userId]);


    // Resending messages when the user comes back online
    useEffect(() => {

        const retrySendingMessages = () => {

            const savedMessages = localStorage.getItem("savedMessages");
            if (!savedMessages || !socket) return;

            // Parse the saved messages from local storage
            const parsedMessages = JSON.parse(savedMessages)


            if (parsedMessages.length > 0) {

                try {
                    // Emit the message to the server
                    parsedMessages.forEach((message: localStorageMessage) => {
                        socket.emit("sendMessage", {
                            text: message.text || null,
                            photo: message.photo || null,
                            chatId: message.chatId,
                            senderId: message.senderId,
                            localId: message.localId,
                        });
                    });

                    console.log("✅ Offline messages resent");

                    const handleOnline = () => {
                        if (socket) {
                            retrySendingMessages();
                        }
                    };


                    window.addEventListener("online", handleOnline);
                    return () => {
                        window.removeEventListener("online", handleOnline);
                    }

                } catch (error) {
                    console.error("Error sending offline messages");
                }
            }
        }
    }, [socket]);



    return (
        <div className='absolute bottom-11 md:bottom-0 px-4 w-full min-h-17 md:min-h-19 flex pb-2 md:pb-4 items-end justify-center border-b-1 line z-20 bg-black'>
            <div className='w-full flex flex-row items-end justify-between border-1 border-gray-600 rounded-3xl px-2 py-2 gap-1 '>
                <CiFaceSmile size={30} />
                <textarea
                    name="message"
                    ref={textareaRef}
                    onInput={handleInput}
                    rows={1}
                    autoCorrect="on"
                    spellCheck={false}
                    id="message"
                    placeholder='Message...'
                    autoCapitalize='sentences'
                    className='overflow-y-auto [scrollbar-width:none] bg-transparent resize-none focus:outline-none flex-1'
                    style={{ maxHeight: "100px" }}
                />

                {sendButtonVisible ? (

                    <button
                        title='Send message'
                        onClick={handleSendMessage}
                        className='text-blue-400 cursor-pointer hover-black'
                    >
                        <IoIosSend size={30} />
                    </button>
                ) : (
                    <>
                        <button
                            title='Send photo'
                            className='cursor-pointer'
                        >
                            <CiImageOn size={30} />
                        </button>
                        <button
                            title='Send like'
                            className='cursor-pointer'
                        >
                            <CiHeart size={30} />
                        </button>

                    </>
                )}

            </div>
        </div>
    )
}

export default MessageInput