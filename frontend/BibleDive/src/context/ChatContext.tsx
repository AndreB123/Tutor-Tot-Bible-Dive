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

interface ChatSummary {
    id: number;
    name: string;
}


interface ChatContextType {
    chats: Chat[];
    chatSummaries: ChatSummary[];
    setChats: (chats: Chat[]) => void;
    addMessageToChat: (message: Message) => void;
    sendMessage: (message: Message) => void;
    updateMessageFragment: (message: Message) => void;
    getChatById: (id: number) => Chat | undefined;
    getChatSummaries: () => void;
    chatId: number;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }) => {
    const [ chats, setChats] = useState<Chat[]>([]);
    const [ chatId, setChatId] = useState<number>(0);
    const [ chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
    const { logoutInitiated } = useAuth();

    useEffect(() => {
        if (logoutInitiated) {
            setChats([]);
            setChatSummaries([]);
            setChatId(0);
        }
    }, [logoutInitiated]);

    
    const updateChatMessages = (prevChats, message) => {
        if (!message.body) {
            return prevChats;
        }
        return prevChats.map(chat => {
            if (chat.id === message.chat_id || chat.id === 0) {
                const updatedMessages = chat.messages.map(msg => {
                    if (msg.id === message.id) {
                        return { ...msg, body: msg.body + message.body, chat_id: message.chat_id };
                    }
                    return msg;
                });

                if (!updatedMessages.some(msg => msg.id === message.id)) {
                    updatedMessages.push(message);
                }

                return { ...chat, id: message.chat_id, messages: updatedMessages };
            }
            return chat;
        });
    };

    const updateMessageFragment = useCallback((message: Message) => {
        console.log('Updating message fragment:', message);
    
        setChats(prevChats => {
            const updatedChats = updateChatMessages(prevChats, message);
            console.log('Chats updated:', JSON.stringify(updatedChats));
            setChatId(message.chat_id);
            return updatedChats;
        });
    }, []);
    
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
                return [...prevChats, newChat];
            }
    
            const updatedChats = updateChatMessages(prevChats, message);
            console.log('Chats updated:', JSON.stringify(updatedChats));
            
            return updatedChats;
        });
    }, []);

    const handleGetChatSummaries = useCallback((summaries: ChatSummary[]) => {
        setChatSummaries(summaries);
    }, []);

    const getChatSummaries = useCallback(async () => {
        try {
            const jwt = await getAccessToken();
            if (jwt) {
                await chatService.getChatSummaries("user_id", jwt);
            }
        } catch (error) {
            console.error("Failed to get chat summaries:", error);
        }
    }, []);

    const chatService = useMemo(() => new ChatService(
        WebSocketService, 
        updateMessageFragment, 
        addMessageToChat,
        handleGetChatSummaries 
    ), [updateMessageFragment, addMessageToChat, handleGetChatSummaries])

    const sendMessage = async (message) => {
        try {
            const jwt = await getAccessToken();
            if (jwt) {
                await chatService.sendChatMessage(message.chat_id, message.sender.toString(), message.body, jwt);
                console.log("Message sent successfully");
                addMessageToChat(message); 
                console.log("Message added to chat:", message);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    }

    const getChatById = (id: number) => {
        return chats.find(chat => chat.id === id);
    };

    const value = useMemo( ()=> ({
        sendMessage,
        chats,
        setChats,
        chatSummaries,
        addMessageToChat: addMessageToChat,
        updateMessageFragment,
        getChatById,
        getChatSummaries,
        chatId
    }), [sendMessage, chats, chatSummaries, chatId]);

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