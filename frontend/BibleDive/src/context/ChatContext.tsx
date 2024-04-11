import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

interface Message {
    id: number;
    chat_id: number;
    sender: string;
    body: string;
    create_at: Date;
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
    currentChat: Chat | null;
    chats: Chat[];
    setCurrentChat: (chat: Chat) => void;
    setChats: (chats: Chat[]) => void;
    addMessgeToChat: (message: Message) => void;
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

    const addMessgeToChat = (message: Message) => {
        if (currentChat && message.chat_id === currentChat.id) {
            setCurrentChat({
                ...currentChat,
                messages: [...currentChat.messages, message],
            });
        }
    };

    const value = useMemo( ()=> ({
        currentChat,
        chats,
        setCurrentChat: handleSetCurrentChat,
        setChats: handleSetChats,
        addMessgeToChat: addMessgeToChat,
    }), [currentChat, chats, setCurrentChat, setChats]);

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