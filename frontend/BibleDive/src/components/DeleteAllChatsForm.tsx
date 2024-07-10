import React, { useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { useUser } from "../context/UserContext";
import { useChat } from "../context/ChatContext";
import BaseButton from "./templates/BaseButton";
import { InputField } from "./templates/InputField";
import { theme } from "../styles/theme";

const DeleteAllChats = () => {
    const { user } = useUser();
    const { deleteAllChatsByUID } = useChat();
    const [confirmationText, setConfirmationText] = useState("");

    const handleDeleteAllChats = async () => {
        if (confirmationText.toLowerCase() === "delete") {
            await deleteAllChatsByUID(user.user.id);
            Alert.alert("Success", "All chats have been deleted.");
        } else {
            Alert.alert("Error", "Please type 'delete' to confirm.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.disclaimer}>
                This action cannot be undone. Please type 'delete' to confirm deletion of all chats.
            </Text>
            <InputField
                value={confirmationText}
                onChangeText={setConfirmationText}
                placeholder="Type 'delete' to confirm"
                onSubmitEditing={handleDeleteAllChats}
                style={styles.input}
            />
            <BaseButton onPress={handleDeleteAllChats} title="Delete All Chats" style={styles.deleteButton} textStyle={styles.submit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disclaimer: {
        color: 'red',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 20,
        width: '100%',
    },
    deleteButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 5,
    },
    submit: {
        color: theme.colors.textPrimary,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowRadius: 4,
        textShadowOffset: { "width": 0, "height": 4 },
        fontFamily: 'Inter',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '500',
    },
});

export default DeleteAllChats;
