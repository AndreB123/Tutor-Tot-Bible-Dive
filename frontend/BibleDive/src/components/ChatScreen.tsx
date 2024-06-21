import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, FlatList } from "react-native";
import ChatBubble from "./ChatBubble";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from "../styles/theme";
import { useChat } from "../context/ChatContext";
import { useUser } from "../context/UserContext";
import { useMessage } from "../context/MessageContext";
import { Message } from "../models/ChatModels";

const ChatScreen = ({ initialChatId = 0 }) => {
    const [inputText, setInputText] = useState("");
    const { getChatById, chatId } = useChat();
    const { sendMessage, message } = useMessage();
    const flatListRef = useRef(null);
    const { userID } = useUser();
    const [currentChatId, setCurrentChatId] = useState(initialChatId);
    const [localMessages, setLocalMessages] = useState<Message[]>([]);

    // Set currentChatId based on initialChatId or chatId from context
    useEffect(() => {
        if (initialChatId === 0 && chatId !== 0) {
            setCurrentChatId(chatId);
        } else if (initialChatId !== 0) {
            setCurrentChatId(initialChatId);
        }
    }, [chatId, initialChatId]);

    // Clear local messages when the chat changes
    const previousChatIdRef = useRef(currentChatId);
    useEffect(() => {
        if (previousChatIdRef.current !== 0 && currentChatId !== 0) {
            setLocalMessages([]);
        }
        previousChatIdRef.current = currentChatId;
    }, [currentChatId]);


    // Update chat ID based on incoming message fragments
    useEffect(() => {
        if (message && message.chat_id !== currentChatId) {
            setCurrentChatId(message.chat_id);
            previousChatIdRef.current = currentChatId;
        }
    }, [message]);

    // Get the current chat object
    const chat = useMemo(() => getChatById(currentChatId) || { id: currentChatId, name: '', messages: [] }, [currentChatId, getChatById]);


    // Append new user message to local messages and send it
    const pushMessage = () => {
        if (inputText.trim()) {
            const newMessage: Message = {
                id: Date.now(), // Temporary ID
                chat_id: chat.id,
                sender: userID,
                body: inputText,
                created_at: new Date(),
            };
            setLocalMessages(prevMessages => [...prevMessages, newMessage]);
            sendMessage(chat.id, userID, inputText);
            setInputText("");
        }
    };

    // Scroll to the end of the message list
    const scrollToEnd = useCallback(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 10);
    }, []);

    // Scroll to end whenever messages change
    useEffect(() => {
        scrollToEnd();
    }, [chat.messages, localMessages, message, scrollToEnd]);

    const sortedMessages = useMemo(() => {
        return [...chat.messages, ...(message && !chat.messages.find(m => m.id === message.id) ? [message] : []), ...localMessages]
        .sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },[chat.messages, localMessages, message]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
        >
            <FlatList
                ref={flatListRef}
                data={sortedMessages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ChatBubble key={item.id} id={item.id} message={item.body} isSender={item.sender == userID} />
                )}
                contentContainerStyle={styles.messagesContainer}
                onContentSizeChange={scrollToEnd}
                onLayout={scrollToEnd}
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
                    <Icon name="send" size={27} color="#FFF" />
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
        flexGrow: 1,
        padding: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        backgroundColor: theme.colors.secondaryBackground,
    },
    inputField: {
        flexGrow: 1,
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
