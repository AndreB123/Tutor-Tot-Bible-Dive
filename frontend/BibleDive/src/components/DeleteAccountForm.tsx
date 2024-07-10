import React, { useState } from "react";
import { useUser } from "../context/UserContext"
import { View, Text,  StyleSheet, Alert } from "react-native";
import BaseButton from "./templates/BaseButton";
import { InputField } from "./templates/InputField";
import { theme } from "../styles/theme";

const AccountDeletion = () => {
    const {delteUserAccount} = useUser();
    const [confirmationText, setConfirmationText] = useState("");
    //TODO verify old password before allowing delete

    const handleDeleteAccount= () => {
        if (confirmationText.toLowerCase() === "delete") {
            delteUserAccount();
        } else {
            Alert.alert("Failed to delete account", "Please type 'delete' to confirm.");
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.disclaimer}>
                This action cannot be undone. Please type 'delete' to confirm account deletion.
            </Text>
            <InputField
                value={confirmationText}
                onChangeText={setConfirmationText}
                placeholder="Type 'delete' to confirm"
                onSubmitEditing={handleDeleteAccount}
                style={styles.input}
            />
            <BaseButton onPress={handleDeleteAccount} title="Delete Account" style={styles.deleteButton} textStyle={styles.submit} />
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

export default AccountDeletion;