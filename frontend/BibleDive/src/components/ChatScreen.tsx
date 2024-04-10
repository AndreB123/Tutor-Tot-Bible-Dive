import React, { useEffect, useState } from "react";
import { View } from "react-native";
import ChatBubble from "./ChatBubble";

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    
    useEffect(() => {
        const receiveMessage = (newMessage) => {
            setMessages(prevMessages => [...prevMessages, newMessage]);
        };

        
    });

    return (
        <View>
            {messages.map((message, index) => (
                <ChatBubble key={index} message={message} isSender={message.senderName}/>
            ))}
        </View>
    );
};

export default ChatScreen;