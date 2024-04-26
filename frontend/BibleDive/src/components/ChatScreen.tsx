import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, FlatList } from "react-native";
import ChatBubble from "./ChatBubble";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { theme } from "../styles/theme";
import { useChat } from "../context/ChatContext";
import { useUser } from "../context/UserContext";


const ChatScreen = ({ initialChatId = 0}) => {
    const [inputText, setInputText] = useState("");
    const { currentChat, sendMessage } = useChat();
    const flatListRef = useRef(null);
    const { userID } = useUser();

    const [chatId, setChatId] = useState(currentChat?.id || initialChatId);

    useEffect (()=> {
        if (currentChat) {
            setChatId(currentChat.id);
        }
    }, [currentChat]);

    const pushMessage = () => {
        if (inputText.trim()) {
            const TempMsgId = Date.now();
            const newMessage = {
                id: TempMsgId,
                chat_id: chatId,
                body: inputText,
                sender: userID,
                created_at: new Date(),
            };
            sendMessage(newMessage);
            setInputText("");
        }
    };

    return (
        <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
    >
         <FlatList
                ref={flatListRef}
                data={currentChat?.messages || []}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                renderItem={({ item }) => (
                    <ChatBubble message={item.body} isSender={item.sender === userID} />
                )}
                contentContainerStyle={styles.messagesContainer}
                onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
            />
        <View style={styles.inputContainer}>
                <TextInput
                    style={styles.inputField}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    returnKeyType="send"
                    onSubmitEditing={pushMessage}
                />
            <TouchableOpacity onPress={pushMessage} style={styles.sendButton}>
                <Icon name="send" size={27} color="#FFF"/>
            </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
        padding: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        backgroundColor: theme.colors.secondaryBackground,
    },
    inputField: {
        flex: 1,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 40,
        color: theme.colors.background,
    },
    sendButton: {
        backgroundColor: '#007aff',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen;