import React from "react";
import { View } from "react-native";
import { createStyleSheet } from "../styles/useStyles";

interface ChatBubbleProps {
    message: {
        sender: string;
        text: string;
    }
    isSender: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isSender }) => {
    return (
        <View style={[
            styles.bubble,
            isSender ? styles.sender : styles.receiver
        ]}>
            
        </View>
    )
}

const styles = createStyleSheet(theme => ({
    bubble: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 20,
        marginVertical: 5,
        alignSelf: 'flex-start',
    },
    sender: {
        backgroundColor: '#DCF8C5', 
        marginLeft: 'auto',
    },
    receiver: {
        backgroundColor: '#ECECEC', 
    },
    senderName: {
        fontWeight: 'bold',
    },
    messageText: {
        marginTop: 5,
    },
}));

export default ChatBubble