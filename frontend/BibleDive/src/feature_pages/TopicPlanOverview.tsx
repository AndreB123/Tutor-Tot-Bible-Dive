import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTopicPlan } from "../context/TopicPlanContext";
import { RootStackParamList } from "../navigation/Navigationtypes";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface TopicPlanOverviewProps {
    testID?: string;
}

export const TopicPlanOverview: React.FC<TopicPlanOverviewProps> = (props) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { topicPlanID } = route.params as { topicPlanID: number };
    const { topicPlan, loading, setLoading } = useTopicPlan(); // Add setLoading from context

    useEffect(() => {
        if (!loading && !topicPlan) {
            navigation.goBack();
        }
    }, [loading, topicPlan, navigation]);

    const handleLessonPress = (lessonID: number) => {
        setLoading(true);
        navigation.navigate('LessonDetail', { lessonID });
    };

    const renderLessonItem = ({ item, index }) => {
        const isLocked = index > 0 && !topicPlan.lessons[index - 1].completed;
        return (
            <TouchableOpacity
                style={[styles.lessonButton, isLocked && styles.lockedLessonButton]}
                disabled={isLocked}
                onPress={() => handleLessonPress(item.id)} // Handle lesson press
            >
                <Text style={styles.lessonText}>{item.title}</Text>
                {isLocked && <Text style={styles.lockedText}>Locked</Text>}
            </TouchableOpacity>
        );
    };

    if (loading || !topicPlan) {
        return <ActivityIndicator size="large" color="#000" style={styles.loader} />;
    }

    return (
        <View style={styles.container} testID={props.testID}>
            <Text style={styles.title}>{topicPlan.title}</Text>
            <Text style={styles.objective}>{topicPlan.objective}</Text>
            <FlatList
                data={topicPlan.lessons}
                renderItem={renderLessonItem}
                keyExtractor={(item) => item.id.toString()}
            />
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
    objective: {
        fontSize: 18,
        marginBottom: 20,
    },
    lessonButton: {
        padding: 15,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    lockedLessonButton: {
        backgroundColor: '#cccccc',
    },
    lessonText: {
        fontSize: 16,
        color: '#fff',
    },
    lockedText: {
        fontSize: 12,
        color: '#ff0000',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
