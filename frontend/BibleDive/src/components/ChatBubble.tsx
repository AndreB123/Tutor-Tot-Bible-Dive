import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import { createStyleSheet } from "../styles/useStyles";

export interface ChatBubbleProps {
    message: string;
    isSender: boolean;
}

 const ChatBubble =({ message, isSender }: ChatBubbleProps) => {
    const [bubbleWidth, setBubbleWidth] = useState(new Animated.Value(10));

    useEffect(() => {
        // Simple heuristic to estimate width based on message length
        const newWidth = Math.max(50, message.length * 8); // Ensure minimum width and scale by character count
        Animated.timing(bubbleWidth, {
            toValue: newWidth,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [message]);

    const styles = createStyleSheet(theme => ({
        bubble: {
            maxWidth: '80%',
            borderRadius: 20,
            marginVertical: 5,
            padding: 10,
            alignSelf: isSender ? 'flex-end' : 'flex-start',
            backgroundColor: isSender ? '#DCF8C5' : '#ECECEC',
        },
        messageText: {
            fontSize: 16,
        },
    }));

    return (
        <Animated.View style={[styles.bubble, { width: bubbleWidth }]}>
            <Text style={styles.messageText}>{message}</Text>
        </Animated.View>
    );
}


export default ChatBubble;