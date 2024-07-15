import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

export const LessonOptions: React.FC = () => {
    // Placeholder response from the API
    const lessonResponse = "This is the placeholder response from the API.";

    const handleOptionPress = (level: string) => {
        console.log(`User selected: ${level}`);
    };

    return (
        <ImageBackground 
            source={require('./assets/file-i8FTAzicF9GGRFcilarJjKtP.png')} // Corrected path for local image
            style={styles.container}
        >
            <Text style={styles.response}>{lessonResponse}</Text>
            <View style={styles.optionsContainer}>
                <View style={styles.options}>
                    <TouchableOpacity style={styles.button} onPress={() => handleOptionPress('Shallow Dive')}>
                        <Icon name="user" size={20} color="#fff" style={styles.icon} />
                        <Text style={styles.buttonText}>Shallow Dive</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => handleOptionPress('Scuba Dive')}>
                        <Icon name="user" size={20} color="#fff" style={styles.icon} />
                        <Text style={styles.buttonText}>Scuba Dive</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => handleOptionPress('Deep Dive')}>
                        <Icon name="submarine" size={20} color="#fff" style={styles.icon} />
                        <Text style={styles.buttonText}>Deep Dive</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.separatorContainer}>
                    <View style={styles.separator}>
                        <Text style={styles.orText}>or</Text>
                    </View>
                </View>
                <View style={styles.freeDiveContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => handleOptionPress('Free Dive')}>
                        <Icon name="swimmer" size={20} color="#ff4500" style={styles.icon} />
                        <Text style={[styles.buttonText, { color: '#ff4500' }]}>Free Dive</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
