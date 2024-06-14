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
    getChatSummaries: (userID: string) => void;
    getRecentMessages: (chatID: number) => Promise<void>;
    chatId: number;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [chatId, setChatId] = useState<number>(0);
    const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
    const { logoutInitiated } = useAuth();

    useEffect(() => {
        if (logoutInitiated) {
            setChats([]);
            setChatSummaries([]);
            setChatId(0);
        }
    }, [logoutInitiated]);

    const updateChatMessages = useCallback((prevChats, message) => {
        if (!message.body) return prevChats;

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
    }, []);

    const updateMessageFragment = useCallback((message: Message) => {
        setChats(prevChats => {
            const updatedChats = updateChatMessages(prevChats, message);
            setChatId(message.chat_id);
            return updatedChats;
        });
    }, [updateChatMessages]);

    const addMessageToChat = useCallback((message: Message) => {
        setChats(prevChats => {
            const chatExists = prevChats.some(chat => chat.id === message.chat_id || chat.id === 0);
            if (!chatExists) {
                const newChat = { id: message.chat_id, name: '', messages: [message] };
                return [...prevChats, newChat];
            }

            return updateChatMessages(prevChats, message);
        });
    }, [updateChatMessages]);

    const handleGetRecentMessages = useCallback((message: any) => {
        const { messages } = message.data;
        const chat_id = messages.length > 0 ? messages[0].chat_id : null;

        if (!chat_id) return;

        setChats(prevChats => {
            const chatExists = prevChats.some(chat => chat.id === chat_id);
            if (!chatExists) {
                const newChat = { id: chat_id, name: '', messages: [] };
                prevChats = [...prevChats, newChat];
            }

            return prevChats.map(chat => {
                if (chat.id === chat_id) {
                    const updatedMessages = messages.map((msg: any) => ({
                        id: msg.id,
                        chat_id: msg.chat_id,
                        sender: msg.sender,
                        body: msg.body,
                        created_at: new Date(msg.created_at.seconds * 1000 + msg.created_at.nanos / 1000000),
                    }));

                    const uniqueMessages = updatedMessages.filter(msg => !chat.messages.some(m => m.id === msg.id));
                    const mergedMessages = [...chat.messages, ...uniqueMessages].sort((a, b) => a.created_at - b.created_at);

                    return { ...chat, messages: mergedMessages };
                }
                return chat;
            });
        });
    }, []);

    const handleGetChatSummaries = useCallback((summaries: ChatSummary[]) => {
        setChatSummaries(prevSummaries => {
            if (JSON.stringify(prevSummaries) === JSON.stringify(summaries)) {
                return prevSummaries;
            }
            return summaries;
        });
    }, []);

    const getChatSummaries = useCallback(async (userID: string) => {
        try {
            const jwt = await getAccessToken();
            if (jwt) {
                await chatService.getChatSummaries(userID, jwt);
            }
        } catch (error) {
            console.error("Failed to get chat summaries:", error);
        }
    }, []);

    const chatService = useMemo(() => new ChatService(
        WebSocketService,
        updateMessageFragment,
        addMessageToChat,
        handleGetChatSummaries,
        handleGetRecentMessages
    ), [updateMessageFragment, addMessageToChat, handleGetChatSummaries, handleGetRecentMessages]);

    const sendMessage = async (message: Message) => {
        try {
            const jwt = await getAccessToken();
            if (jwt) {
                await chatService.sendChatMessage(message.chat_id, message.sender.toString(), message.body, jwt);
                addMessageToChat(message);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const getChatById = (id: number) => {
        return chats.find(chat => chat.id === id);
    };

    const getRecentMessages = useCallback(async (chatID: number) => {
        try {
            const jwt = await getAccessToken();
            if (jwt) {
                const lastMessageId = 0;
                await chatService.getRecentChatMessages(chatID, lastMessageId, jwt);
            }
        } catch (error) {
            console.error("Failed to get recent messages:", error);
            throw error;
        }
    }, []);

    const value = useMemo(() => ({
        sendMessage,
        chats,
        setChats,
        chatSummaries,
        addMessageToChat,
        updateMessageFragment,
        getChatById,
        getChatSummaries,
        getRecentMessages,
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
