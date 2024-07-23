import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTopicPlan } from "../context/TopicPlanContext";
import { RootStackParamList } from '../navigation/Navigationtypes';
import { LoadingOverlay } from "./templates/LoadingOverlay";

const { height } = Dimensions.get('window');

const LessonOptions = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { generateTopicPlan, topicPlanOverview, loading, topicPlan } = useTopicPlan();
    const [errorMessage, setErrorMessage] = useState("");
    const scrollViewRef = useRef<ScrollView>(null);
    const optionsRef = useRef<View>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading) {
                console.warn('Request timed out. Navigating back.');
                setErrorMessage("Request timed out. Please try again.");
                navigation.goBack();
            }
        }, 30000);

        return () => clearTimeout(timeout);
    }, [loading, navigation]);

    const handleOptionPress = async (numberOfLessons: number) => {
        if (topicPlan) {
            await generateTopicPlan(topicPlan.id, numberOfLessons);
            navigation.navigate('TopicPlanOverview', { topicPlanID: topicPlan.id });
        } else {
            console.error('Topic Plan ID is not set');
        }
    };

    const handleDiveInPress = () => {
        optionsRef.current?.measureLayout(
            scrollViewRef.current as any,
            (x, y) => {
                scrollViewRef.current?.scrollTo({ y, animated: true });
            },
            () => console.error('Error in measuring layout')
        );
    };

    const handleFreeDivePress = () => {
        navigation.navigate('ChatPage', { chatID: 0 });
    };

    return (
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollViewContent} style={styles.container}>
            <View style={styles.screen}>
                <ImageBackground source={require('../assets/deepSea.jpg')} style={styles.backgroundImage}>
                    <View style={styles.overviewContainer}>
                        {errorMessage ? (
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        ) : (
                            <Text style={styles.response}>{topicPlanOverview || "Loading topic plan overview..."}</Text>
                        )}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.actionButton} onPress={handleDiveInPress}>
                                <Text style={styles.buttonText}>Dive In</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.goBack()}>
                                <Text style={styles.buttonText}>Back to Prompt</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
            <View style={styles.screen} ref={optionsRef}>
                <ImageBackground source={require('../assets/seascape.webp')} style={styles.backgroundImage}>
                    <View style={styles.optionsContainer}>
                        <View style={styles.leftOptions}>
                            <TouchableOpacity style={styles.button} onPress={() => handleOptionPress(1)}>
                                <Icon name="user" size={20} color="#fff" style={styles.icon} />
                                <Text style={styles.buttonText}>Shallow Dive</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => handleOptionPress(3)}>
                                <Icon name="user" size={20} color="#fff" style={styles.icon} />
                                <Text style={styles.buttonText}>Scuba Dive</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => handleOptionPress(5)}>
                                <Icon name="user" size={20} color="#fff" style={styles.icon} />
                                <Text style={styles.buttonText}>Deep Dive</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.separatorContainer}>
                            <View style={styles.separator} />
                            <Text style={styles.orText}>or</Text>
                        </View>
                        <View style={styles.rightOption}>
                            <TouchableOpacity style={styles.button} onPress={handleFreeDivePress}>
                                <Icon name="user" size={20} color="#ff4500" style={styles.icon} />
                                <Text style={[styles.buttonText, { color: '#ff4500' }]}>Free Dive</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
            <LoadingOverlay visible={loading} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    screen: {
        height: height,  // Take up full screen height
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overviewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    response: {
        fontSize: 18,
        color: "#fff",
        marginBottom: 20,
        textAlign: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background for better readability
        padding: 10,
    },
    errorText: {
        fontSize: 18,
        color: "red",
        marginBottom: 20,
        textAlign: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background for better readability
        padding: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    actionButton: {
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 5,
        margin: 5,
    },
    optionsContainer: {
        flex: 1,
        flexDirection: 'row', // Horizontal layout
        alignItems: 'center',
        padding: 20,
    },
    leftOptions: {
        flex: 3,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 5,
        margin: 5,
    },
    buttonText: {
        color: '#fff',
        marginLeft: 5,
    },
    icon: {
        marginRight: 5,
    },
    separatorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    separator: {
        height: '80%',
        width: 1,
        backgroundColor: '#fff',
    },
    orText: {
        color: '#fff',
        paddingHorizontal: 5,
        fontSize: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -50 }]
    },
    rightOption: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LessonOptions;
