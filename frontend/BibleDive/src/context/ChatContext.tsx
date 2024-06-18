import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import WebSocketService from "../services/WebSocketService";
import ChatService from "../services/ChatService";
import { getAccessToken } from "../utils/SecureStorage";
import { useAuth } from "./AuthContext";
import { Chat, Message } from "../models/ChatModels";

interface ChatContextType {
    chats: Chat[];
    setChats: (chats: Chat[]) => void;
    addMessageToChat: (message: Message) => void;
    getChatById: (id: number) => Chat | undefined;
    getChatSummaries: (userID: string) => void;
    getRecentMessages: (chatID: number) => Promise<void>;
    chatId: number;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [chatId, setChatId] = useState<number>(0);
    const { logoutInitiated } = useAuth();

    useEffect(() => {
        if (logoutInitiated) {
            setChats([]);
            setChatId(0);
        }
    }, [logoutInitiated]);

    const addMessageToChat = useCallback((message: Message) => {
        setChats(prevChats => {
            const chatExists = prevChats.some(chat => chat.id === message.chat_id);
            if (!chatExists) {
                const newChat = { id: message.chat_id, name: '', messages: [message] };
                return [...prevChats, newChat];
            }

            return prevChats.map(chat => {
                if (chat.id === message.chat_id) {
                    const existingMessage = chat.messages.find(msg => msg.id === message.id);
                    if (!existingMessage) {
                        return { ...chat, messages: [...chat.messages, message] };
                    }
                }
                return chat;
            });
        });
    }, []);

    const handleGetChatSummaries = useCallback((summaries: Chat[]) => {
        setChats(prevChats => {
            const updatedChats = summaries.map(summary => {
                const existingChat = prevChats.find(chat => chat.id === summary.id);
                if (existingChat) {
                    return { ...existingChat, name: summary.name };
                } else {
                    return { id: summary.id, name: summary.name, messages: [] };
                }
            });
            return updatedChats;
        });
    }, []);

    const handleGetRecentMessages = useCallback((messages: any[]) => {
        setChats(prevChats => {
            const updatedChats = prevChats.map(chat => {
                const newMessages = messages
                    .filter(msg => msg.chat_id === chat.id && !chat.messages.some(m => m.id === msg.id))
                    .map(msg => ({
                        ...msg,
                        created_at: new Date(msg.created_at.seconds * 1000 + msg.created_at.nanos / 1000000),
                    }));
                return {
                    ...chat,
                    messages: [...chat.messages, ...newMessages].sort((a, b) => a.created_at.getTime() - b.created_at.getTime()),
                };
            });
            return updatedChats;
        });
    }, []);
    
    const chatService = useMemo(() => new ChatService(
        WebSocketService,
        handleGetChatSummaries,
        handleGetRecentMessages
    ), [handleGetChatSummaries, handleGetRecentMessages]);

    const getChatById = useCallback((id: number) => {
        return chats.find(chat => chat.id === id);
    }, [chats]);

    const getChatSummaries = useCallback(async (userID: string) => {
        try {
            const jwt = await getAccessToken();
            if (jwt) {
                await chatService.getChatSummaries(userID, jwt);
            }
        } catch (error) {
            console.error("Failed to get chat summaries:", error);
        }
    }, [chatService]);

    const getRecentMessages = useCallback(async (chatID: number) => {
        try {
            const jwt = await getAccessToken();
            if (jwt) {
                await chatService.getRecentMessages(chatID, 0, jwt);
            }
        } catch (error) {
            console.error("Failed to get recent messages:", error);
        }
    }, [chatService]);

    const value = useMemo(() => ({
        chats,
        setChats,
        addMessageToChat,
        getChatById,
        getChatSummaries,
        getRecentMessages,
        chatId
    }), [chats, addMessageToChat, getChatById, getChatSummaries, getRecentMessages, chatId]);

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