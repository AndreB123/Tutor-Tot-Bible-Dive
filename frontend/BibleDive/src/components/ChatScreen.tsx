import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, FlatList } from "react-native";
import ChatBubble from "./ChatBubble";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { theme } from "../styles/theme";
import { useChat } from "../context/ChatContext";
import { useUser } from "../context/UserContext";


const ChatScreen = () => {
    const [inputText, setInputText] = useState("");
    const { currentChat, setCurrentChat, sendMessage } = useChat();
    const flatListRef = useRef(null);
    const { user } = useUser();


    const pushMessage = () => {
        if (inputText.trim()) {
            const newMessage = {
                id: null,
                chat_id: currentChat ? currentChat.id : Date.now(),
                body: inputText,
                sender: user.username,
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
                data={messages}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                    <ChatBubble message={item.text} isSender={item.senderName === "You"} />
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