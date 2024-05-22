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

    
    // Function to update the chat messages with the new chat_id and add new message fragments
const updateChatMessages = (prevChats, message) => {
    return prevChats.map(chat => {
        if (chat.id === message.chat_id || chat.id === 0) {
            const updatedMessages = chat.messages.map(msg => {
                if (msg.id === message.id) {
                    return { ...msg, body: msg.body + message.body, chat_id: message.chat_id };
                }
                return msg;
            });

            // Ensure all messages have the updated chat_id
            const messagesWithUpdatedChatId = updatedMessages.map(msg => ({
                ...msg,
                chat_id: message.chat_id
            }));

            return { ...chat, id: message.chat_id, messages: messagesWithUpdatedChatId };
        }
        return chat;
    });
};

const updateMessageFragment = useCallback((message: Message) => {
    console.log('Updating message fragment:', message);

    // Update chats with the new message fragment
    setChats(prevChats => {
        const updatedChats = updateChatMessages(prevChats, message);
        console.log('Chats updated:', JSON.stringify(updatedChats));
        return updatedChats;
    });

    // Update current chat if it matches the message's chat_id or has a temporary chat_id of 0
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

    // Update chats with the new message
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

        const updatedChats = updateChatMessages(prevChats, message);
        console.log('Chats updated:', JSON.stringify(updatedChats));
        return updatedChats;
    });

    // Update current chat if it matches the message's chat_id or has a temporary chat_id of 0
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