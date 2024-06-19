import React, { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { createStyleSheet } from "../styles/useStyles";

export interface ChatBubbleProps {
    id: number;
    message: string;
    isSender: boolean;
}

const ChatBubble = ({ id, message = "", isSender }: ChatBubbleProps) => {
    const textRef = useRef(null);

    useEffect(() => {
        console.log("new chat bubble with ID:", id);
    }, [message, id]);

    const styles = createStyleSheet(theme => ({
        bubble: {
            maxWidth: '80%',
            borderRadius: 20,
            marginVertical: 5,
            padding: 10,
            alignSelf: isSender ? 'flex-end' : 'flex-start',
            backgroundColor: isSender ? '#DCF8C5' : '#ECECEC',
            overflow: 'hidden',
        },
        messageText: {
            fontSize: 16,
        },
    }));

    return (
        <View style={styles.bubble}>
            <Text style={styles.messageText} ref={textRef}>{message}</Text>
        </View>
    );
};

export default ChatBubble;
