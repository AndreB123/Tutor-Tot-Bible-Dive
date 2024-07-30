import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from '@react-navigation/native';

export const LessonDetail: React.FC = () => {
    const route = useRoute();
    const { lessonID } = route.params as { lessonID: number };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lesson Detail</Text>
            <Text style={styles.lessonID}>Lesson ID: {lessonID}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    lessonID: {
        fontSize: 18,
    },
});

export default LessonDetail;
