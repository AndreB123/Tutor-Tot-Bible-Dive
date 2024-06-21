import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, FlatList, Keyboard } from "react-native";
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

    useEffect(() => {
        if (initialChatId === 0 && chatId !== 0) {
            setCurrentChatId(chatId);
        } else if (initialChatId !== 0) {
            setCurrentChatId(initialChatId);
        }
    }, [chatId, initialChatId]);

    const previousChatIdRef = useRef(currentChatId);
    useEffect(() => {
        if (previousChatIdRef.current !== 0 && currentChatId !== 0) {
            setLocalMessages([]);
        }
        previousChatIdRef.current = currentChatId;
    }, [currentChatId]);

    useEffect(() => {
        if (message && message.chat_id !== currentChatId) {
            setCurrentChatId(message.chat_id);
            previousChatIdRef.current = currentChatId;
        }
    }, [message]);

    const chat = useMemo(() => getChatById(currentChatId) || { id: currentChatId, name: '', messages: [] }, [currentChatId, getChatById]);

    const pushMessage = () => {
        if (inputText.trim()) {
            const newMessage: Message = {
                id: Date.now(),
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

    const scrollToEnd = useCallback(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, []);

    useEffect(() => {
        scrollToEnd();
    }, [chat.messages, localMessages, message, scrollToEnd]);

    const sortedMessages = useMemo(() => {
        return [...chat.messages, ...(message && !chat.messages.find(m => m.id === message.id) ? [message] : []), ...localMessages]
        .sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },[chat.messages, localMessages, message]);

    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", scrollToEnd);
        const hideSubscription = Keyboard.addListener("keyboardDidHide", scrollToEnd);

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [scrollToEnd]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
        >
            <View style={styles.innerContainer}>
                <FlatList
                    ref={flatListRef}
                    data={sortedMessages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <ChatBubble key={item.id} id={item.id} message={item.body} isSender={item.sender == userID} />
                    )}
                    contentContainerStyle={styles.messagesContainer}
                    ListFooterComponent={<View style={{ height: 20 }} />}
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
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    innerContainer: {
        flex: 1,
    },
    messagesContainer: {
        flexGrow: 1,
        padding: 10,
        marginBottom: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        backgroundColor: theme.colors.secondaryBackground,
        height: 60,
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
