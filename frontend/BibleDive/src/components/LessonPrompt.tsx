import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { SubmitButton } from "./SubmitButton";

export const LessonPrompt: React.FC = () => {
    const [input, setInput] = useState("");

    const handleInputChange = (text: string) => {
        setInput(text);
    };

    const handleSubmit = () => {
        // Handle the submit logic here
        console.log("User input:", input);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.instruction}>Enter a Bible subject, prompt, or question you want to learn about:</Text>
            <TextInput
                style={styles.input}
                placeholder="Type your question here"
                value={input}
                onChangeText={handleInputChange}
            />
            <SubmitButton onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#fff",
    },
    instruction: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
});
