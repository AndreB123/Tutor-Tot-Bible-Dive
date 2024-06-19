import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import WebSocketService from "../services/WebSocketService";
import MessageService from "../services/MessageService";
import { getAccessToken } from "../utils/SecureStorage";
import { Message } from "../models/ChatModels";
import { useChat } from "./ChatContext";

interface MessageContextType {
    message: Message | null;
    setMessageFragment: (fragment: Partial<Message>) => void;
    clearMessage: () => void;
    sendMessage: (chatID: number, userID: string, body: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | null>(null);

export const MessageProvider = ({ children }) => {
    const [message, setMessage] = useState<Message | null>(null);
    const { addMessageToChat } = useChat();

    const setMessageFragment = useCallback((fragment: Partial<Message>) => {
        setMessage(prevMessage => ({
            ...prevMessage,
            ...fragment,
            body: (prevMessage?.body || '') + (fragment.body || '')
        } as Message));
    }, []);

    const clearMessage = useCallback(() => {
        setMessage(null);
    }, []);

    const addMessage = useCallback(() => {
        if (message) {
            addMessageToChat(message);
            console.log("Adding message to chat:", message.id, message.body);
            clearMessage();
        }
    }, [addMessageToChat, clearMessage, message]);

    const messageService = useMemo(() => new MessageService(
        WebSocketService,
        setMessageFragment,
        () => {
            console.log("Message stream complete, adding message to chat.");
            addMessage();
        }
    ), [setMessageFragment, addMessage]);

    const sendMessage = useCallback(async (chatID: number, userID: string, body: string) => {
        try {
            const jwt = await getAccessToken();
            if (jwt) {
                await messageService.sendMessage(chatID, userID, body, jwt);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    }, [messageService]);

    const value = useMemo(() => ({
        message,
        setMessageFragment,
        clearMessage,
        sendMessage,
    }), [message, setMessageFragment, clearMessage, sendMessage]);

    return (
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = () => {
    const context = useContext(MessageContext);
    if (context === null) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return context;
};
