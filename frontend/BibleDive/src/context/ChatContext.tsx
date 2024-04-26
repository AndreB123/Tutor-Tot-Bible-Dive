import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import WebSocketService from "../services/WebSocketService";
import ChatService from "../services/ChatService";
import { useUser } from "./UserContext";
import { getAccessToken } from "../utils/SecureStorage";


interface Message {
    id: number;
    chat_id: number;
    sender: string;
    body: string;
    created_at: Date;
}

interface Chat {
    id: number;
    name: string;
    messages: Message[];
}


interface ChatContextType {
    currentChat: Chat | null;
    chats: Chat[];
    setCurrentChat: (chat: Chat) => void;
    setChats: (chats: Chat[]) => void;
    addMessageToChat: (message: Message) => void;
    sendMessage: (message: Message) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }) => {
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);

    const handleSetCurrentChat = useCallback((chat: Chat) => {
        setCurrentChat(chat);
    }, []);

    const handleSetChats = useCallback((chats: Chat[]) => {
        setChats(chats);
    }, []);

    const updateChatId = useCallback((tempId, newId, newName) => {
        setChats(prevChats => prevChats.map(chat => {
            if (chat.id === tempId) {
                // Update all messages within the chat to reflect the new chat ID
                const updatedMessages = chat.messages.map(message => ({ ...message, chat_id: newId }));
                return { ...chat, id: newId, name: newName, messages: updatedMessages };
            }
            return chat;
        }));
        if (currentChat && currentChat.id === tempId) {
            setCurrentChat(prevChat => ({ ...prevChat, id: newId, name: newName }));
        }
    }, []);
    

    const updateMessageFragment = useCallback((message) => {
        setChats(prevChats => {
            const updatedChats = prevChats.map(chat => {
                if (chat.id === message.chat_id) {
                    const updatedMessages = chat.messages.map(msg => {
                        if (msg.id === message.id) {
                            return { ...msg, body: message.body};
                        }
                        return msg;
                    });
                    return { ...chat, messages: updatedMessages };
                }
               return chat;
            });
            return updatedChats;
        });
    }, []);

    const addMessageToChat = useCallback((message) =>{
        setChats(prevChats =>{
            const updatedChats = prevChats.map(chat => {
                if (chat.id === message.chat_id) {
                    const messageExists = chat.messages.some(m => m.id === message.id);
                    if (!messageExists) {
                        return { ...chat, messages: [...chat.messages, message]};
                    }
                }
                return chat;
            });
            return updatedChats;
        });
    }, []);

    const chatService = useMemo(() => new ChatService(WebSocketService, updateMessageFragment, addMessageToChat),[updateMessageFragment, addMessageToChat])

    const sendMessage = async (message) => {
        try {
            const jwt = await getAccessToken(); 
            await chatService.sendChatMessage(message.chat_id, message.sender, message.body, jwt);
            console.log("Message sent successfully");
            addMessageToChat(message); 
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    }

    
    useEffect(() => {
        if (currentChat && chats.length > 0) {
            const updateCurrentChat = chats.find(chat => chat.id === currentChat.id);
            setCurrentChat(updateCurrentChat);
        }
    }, [chats, currentChat]);


    const value = useMemo( ()=> ({
        sendMessage,
        currentChat,
        chats,
        setCurrentChat: handleSetCurrentChat,
        setChats: handleSetChats,
        addMessageToChat: addMessageToChat,
        updateMessageFragment,
        updateChatId
    }), [sendMessage, currentChat, chats, setCurrentChat, setChats, updateChatId ]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === null) {
        throw new Error('useChat must be used within a ChatProvider');

    }
    return context;
};