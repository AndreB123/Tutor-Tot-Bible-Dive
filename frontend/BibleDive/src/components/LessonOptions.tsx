import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTopicPlan } from "../context/TopicPlanContext";
import { RootStackParamList } from "../navigation/Navigationtypes";
import { LoadingOverlay } from "./templates/LoadingOverlay";

const LessonOptions = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { generateTopicPlan, topicPlanOverview, loading, topicPlan } = useTopicPlan();
    const [errorMessage, setErrorMessage] = useState("");

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

    return (
        <ImageBackground 
            source={require('../assets/deepSea.jpg')}
            style={styles.container}
        >
            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
            ) : (
                <Text style={styles.response}>{topicPlanOverview || "Loading topic plan overview..."}</Text>
            )}
            <View style={styles.optionsContainer}>
                <View style={styles.options}>
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
                    <View style={styles.separator}>
                        <Text style={styles.orText}>or</Text>
                    </View>
                </View>
                <View style={styles.freeDiveContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => handleOptionPress(0)}>
                        <Icon name="user" size={20} color="#ff4500" style={styles.icon} />
                        <Text style={[styles.buttonText, { color: '#ff4500' }]}>Free Dive</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <LoadingOverlay visible={loading} />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
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
    optionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    options: {
        flex: 3,
        justifyContent: 'space-around',
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
        height: '100%',
        width: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orText: {
        backgroundColor: '#000',
        color: '#fff',
        paddingHorizontal: 5,
    },
    freeDiveContainer: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LessonOptions;
