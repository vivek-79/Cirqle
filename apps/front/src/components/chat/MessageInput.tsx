
'use client'
import { MessageContext } from '@/context/MessageContext';
// import { WebSocketContext } from '@/lib/socket';
import { ChangeEvent, FormEvent, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CiFaceSmile } from "react-icons/ci";
import { CiImageOn } from "react-icons/ci";
import { CiHeart } from "react-icons/ci";
import { IoIosSend } from "react-icons/io";
import { localStorageMessage } from './ChatBox';
import { useSocket } from '@/hooks/webSocket';
import axios from 'axios';
import { api } from '@/constants';
import { useReplyingMessage, useUnseenMessageActions } from '@/hooks/store.actions';
import Image from 'next/image';
import { CloudImage } from '@/helpers/getFullImageUrl';


type IMAGE_SEND = {
    localId: number,
    file: File
}

const MessageInput = ({ chatId, userId, accessToken }: { chatId: string, userId: number, accessToken?: string }) => {


    //getting messages context
    const localMessageContext = useContext(MessageContext);
    const replyingToMessage = useReplyingMessage();
    console.log(replyingToMessage?.messageId)
    const { clearReplyingMessage } = useUnseenMessageActions()

    const socket = useSocket()
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [sendingFiles, setSendingFiles] = useState<IMAGE_SEND[] | []>([])
    const mediaRef = useRef<HTMLInputElement | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0);
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
        //CLEAR STORE IF ITS A REPLY
        clearReplyingMessage();

        
        const localId = Date.now();
        
        try {


            //NORMAL MESSAGE SENDING
            //saving message to local storage
            if (localMessageContext ) {

                localMessageContext.addMessage({
                    text: value,
                    chatId,
                    senderId: userId,
                    localId,
                    replyTo:{
                        text: replyingToMessage?.text,
                        photo: replyingToMessage?.photo
                    }
                });
            }

            // Emit the message to the server
            socket.emit("sendMessage", {
                text: value,
                photo: null,
                chatId,
                senderId: userId,
                localId,
                messageId:replyingToMessage?.messageId
            });

            handleInput();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }, [socket, chatId, userId,replyingToMessage]);


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



                } catch (error) {
                    console.error("Error sending offline messages");
                }
            }
        }

        //intentionally calling once
        retrySendingMessages();

        //attaching yo event listener
        const handleOnline = () => {
            if (socket) {
                retrySendingMessages();
            }
        };

        window.addEventListener("online", handleOnline);
        return () => {
            window.removeEventListener("online", handleOnline);
        }
    }, [socket]);

    //handle media
    const handleMedia = (e: ChangeEvent<HTMLInputElement>) => {

        const file = e.target.files?.[0]
        if (!file || !accessToken) return;

        const localId = Date.now();

        //sending Images
        //saving message to local storage
        if (localMessageContext) {

            localMessageContext.addMessage({
                photo: file,
                chatId,
                senderId: userId,
                localId,
            });
        }

        try {

            const formData = new FormData();

            formData.append('media', file);
            formData.append('localId', localId.toString())

            axios.post(`${api}/messages/upload/${chatId}`, formData, {

                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${accessToken}`
                },

                onUploadProgress: (progressEvent) => {

                    if (progressEvent.total) {

                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);

                        setUploadProgress(percent);
                    }
                }
            }
            ).then(() => {
                setUploadProgress(100);
            }).catch(() => {
                setUploadProgress(0)
            })

        } catch (error) {
            console.log(error)
        }

    }


    return (
        <div className='absolute bottom-11 md:bottom-0 px-4 w-full min-h-17 md:min-h-19 flex pb-2 md:pb-4 items-end justify-center border-b-1 line z-20 bg-black'>
            <div className='w-full flex flex-row items-end justify-between border-1 border-gray-600 rounded-3xl px-2 py-2 gap-1 '>

                {/* Replying Message */}
                {replyingToMessage && (
                    <div className='absolute bottom-[90%] right-5 left-5 overflow-hidden max-h-16  wrap-break-word h-fit bg-gray-800 rounded-xl flex flex-row'>
                        {replyingToMessage.text && (

                            <p className='w-[95%] pl-2 overflow-ellipsis'>{replyingToMessage.text}</p>
                        )}
                        
                        {replyingToMessage.photo &&  (
                            <span className='w-[95%] pl-2 overflow-ellipsis'>

                                <Image src={CloudImage(replyingToMessage.photo)} height={100} width={100} alt='image' className='rounded-md h-full  object-cover object-center'/>
                            </span>
                            )}
                        <button 
                            onClick={clearReplyingMessage}
                         className='w-6 min-h-full bg-white/20 hover:bg-white/30 cursor-pointer'>X</button>
                    </div>
                )}
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
                        <input
                            type='file'
                            id='image'
                            className='hidden'
                            ref={mediaRef}
                            onInput={handleMedia}
                        />
                        <label htmlFor="image" className='cursor-pointer'>
                            <CiImageOn size={30} />
                        </label>
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