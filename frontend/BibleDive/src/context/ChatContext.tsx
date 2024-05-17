import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import WebSocketService from "../services/WebSocketService";
import ChatService from "../services/ChatService";
import { getAccessToken } from "../utils/SecureStorage";
import { useAuth } from "./AuthContext";


interface Message {
    id: number | null;
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
    updateMessageFragment: (message: Message) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }) => {
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const { logoutInitiated } = useAuth();

    useEffect(() => {
        if (logoutInitiated) {
            setChats([]);
            setCurrentChat(null);
        }
    }, [logoutInitiated]);

    
    const updateMessageFragment = useCallback((message: Message) => {
        console.log('Updating message fragment:', message);
    
        setChats(prevChats => {
            const updatedChats = prevChats.map(chat => {
                if (chat.id === message.chat_id || chat.id === 0) {
                    const updatedMessages = chat.messages.map(msg => {
                        if (msg.id === message.id) {
                            return { ...msg, body: msg.body + message.body, chat_id: message.chat_id };
                        }
                        return msg;
                    });
    
                    // Update all messages' chat_id to the new chat_id
                    const messagesWithUpdatedChatId = updatedMessages.map(msg => ({
                        ...msg,
                        chat_id: message.chat_id
                    }));
    
                    return { ...chat, id: message.chat_id, messages: messagesWithUpdatedChatId };
                }
                return chat;
            });
            console.log('Chats updated:', JSON.stringify(updatedChats));
            return updatedChats;
        });
    
        if (currentChat?.id === message.chat_id || currentChat?.id === 0) {
            setCurrentChat(prevChat => {
                const updatedMessages = prevChat.messages.map(msg => ({
                    ...msg,
                    chat_id: message.chat_id
                }));
                const updatedChat = {
                    ...prevChat,
                    id: message.chat_id,
                    messages: updatedMessages.map(msg =>
                        msg.id === message.id ? { ...msg, body: msg.body + message.body, chat_id: message.chat_id } : msg
                    )
                };
                console.log('Current chat updated:', JSON.stringify(updatedChat));
                return updatedChat;
            });
        }
    }, [currentChat]);

    const addMessageToChat = useCallback((message: Message) => {
        console.log('Adding message to chat:', message);
    
        setChats(prevChats => {
            const chatExists = prevChats.some(chat => chat.id === message.chat_id || chat.id === 0);
            if (!chatExists) {
                const newChat = {
                    id: message.chat_id,
                    name: '',
                    messages: [message]
                };
                console.log('New chat created:', JSON.stringify(newChat));
                setCurrentChat(newChat);
                return [...prevChats, newChat];
            }
    
            const updatedChats = prevChats.map(chat => {
                if (chat.id === message.chat_id || chat.id === 0) {
                    const updatedMessages = chat.messages.map(msg => ({
                        ...msg,
                        chat_id: message.chat_id
                    }));
    
                    // Ensure all messages have the updated chat_id and append the new message
                    const messagesWithUpdatedChatId = [...updatedMessages, { ...message, chat_id: message.chat_id }];
                    const updatedChat = {
                        ...chat,
                        id: message.chat_id,
                        messages: messagesWithUpdatedChatId
                    };
                    console.log('Updated chat:', JSON.stringify(updatedChat));
                    return updatedChat;
                }
                return chat;
            });
            console.log('Chats updated:', JSON.stringify(updatedChats));
            return updatedChats;
        });
    
        if (currentChat?.id === message.chat_id || currentChat?.id === 0) {
            setCurrentChat(prevChat => {
                const updatedMessages = prevChat.messages.map(msg => ({
                    ...msg,
                    chat_id: message.chat_id
                }));
                const updatedChat = {
                    ...prevChat,
                    id: message.chat_id,
                    messages: [...updatedMessages, message]
                };
                console.log('Current chat updated:', JSON.stringify(updatedChat));
                return updatedChat;
            });
        }
    }, [currentChat]);
    

    const chatService = useMemo(() => new ChatService(
        WebSocketService, 
        updateMessageFragment, 
        addMessageToChat, 
    ), [updateMessageFragment, addMessageToChat])

    const sendMessage = async (message) => {
        try {
            const jwt = await getAccessToken();
            await chatService.sendChatMessage(message.chat_id.toString(), message.sender.toString(), message.body, jwt);
            console.log("Message sent successfully");
            addMessageToChat(message); 
            console.log("Message added to chat:", message);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    }
    
    useEffect(() => {
        if (currentChat && chats.length > 0) {
            const updatedCurrentChat = chats.find(chat => chat.id === currentChat.id);
            setCurrentChat(updatedCurrentChat || null);
        }
    }, [chats, currentChat]);


    const value = useMemo( ()=> ({
        sendMessage,
        currentChat,
        chats,
        setCurrentChat,
        setChats,
        addMessageToChat: addMessageToChat,
        updateMessageFragment,
    }), [sendMessage, currentChat, chats]);

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