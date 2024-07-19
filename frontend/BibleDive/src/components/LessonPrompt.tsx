import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView } from "react-native";
import { SubmitButton } from "./SubmitButton";
import { useTopicPlan } from "../context/TopicPlanContext";
import { useNavigation } from '@react-navigation/native';
import { LoadingOverlay } from "./templates/LoadingOverlay";
import { useUser } from "../context/UserContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigationtypes";

export const LessonPrompt: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [input, setInput] = useState("");
    const { generateTopicPlanOverview, loading } = useTopicPlan();
    const { userID } = useUser();
    
    const handleInputChange = (text: string) => {
        setInput(text);
    };

    const handleSubmit = async () => {
        if (userID && input.trim()) {
            await generateTopicPlanOverview(userID, input);
            navigation.navigate('LessonOptions');
        } else {
            console.error('User ID or input is not set');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.instruction}>Enter a Bible subject, prompt, or question you want to learn about:</Text>
            <TextInput
                style={styles.input}
                placeholder="Type your question here"
                value={input}
                onChangeText={handleInputChange}
            />
            <SubmitButton onPress={handleSubmit}  />
            <LoadingOverlay visible={loading} /> 
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
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
