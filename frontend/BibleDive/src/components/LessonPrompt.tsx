import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, ImageBackground, KeyboardAvoidingView, Platform } from "react-native";
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
    const { generateTopicPlanOverview, topicPlanOverview, loading, setLoading, setTopicPlanOverview } = useTopicPlan();
    const [errorMessage, setErrorMessage] = useState("");

    const { userID } = useUser();
    
    useEffect(() => {
        // Ensure loading is set to false when navigating back to this page
        return () => {
            setLoading(false);
        };
    }, [setLoading]);

    useEffect(() => {
        if (topicPlanOverview) {
            navigation.navigate('LessonOptions');
            setLoading(false);
        }
    }, [topicPlanOverview, navigation, setLoading]);

    const handleInputChange = (text: string) => {
        setInput(text);
    };

    const handleSubmit = async () => {
        if (userID && input.trim()) {
            try {
                setErrorMessage("");  // Clear any previous error messages
                setLoading(true);
                setTopicPlanOverview('');  // Reset topicPlanOverview
                await generateTopicPlanOverview(userID, input);
            } catch (error) {
                console.error('Error generating topic plan overview:', error);
                setErrorMessage("Failed to generate topic plan overview. Please try again.");
                setLoading(false);
            }
        } else {
            setErrorMessage('User ID or input is not set');
            console.error('User ID or input is not set');
        }
    };

    return (
        <ImageBackground source={require('../assets/cartoon_ocean.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        <View style={styles.contentContainer}>
                            <Text style={styles.instruction}>Enter a Bible subject, prompt, or question you want to learn about:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Type your question here"
                                placeholderTextColor="#f8f6f6"
                                value={input}
                                onChangeText={handleInputChange}
                            />
                            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                            <SubmitButton onPress={handleSubmit} />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
                <LoadingOverlay visible={loading} />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: -1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    instruction: {
        fontSize: 16,
        padding: 10,
        marginBottom: 8,
        color: "#fff",
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 16,
        color: "#fff",
        paddingHorizontal: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.50)',
    },
    errorText: {
        fontSize: 16,
        color: "red",
        marginBottom: 8,
        textAlign: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
    },
});

export default LessonPrompt;
