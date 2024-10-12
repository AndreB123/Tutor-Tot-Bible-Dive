import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTopicPlan } from "../context/TopicPlanContext";
import { useLesson } from "../context/LessonContext"; // Import useLesson hook
import { RootStackParamList } from '../navigation/Navigationtypes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface TopicPlanOverviewProps {
    testID?: string;
}

export const TopicPlanOverview: React.FC<TopicPlanOverviewProps> = (props) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { topicPlanID } = route.params as { topicPlanID: number };
    const { topicPlan, loading: topicPlanLoading, setLoading: setTopicPlanLoading, getTopicPlanByID } = useTopicPlan();
    const { setLoading: setLessonsLoading, getLessonByID } = useLesson(); // Use `getLessonByID` for fetching full lesson details

    useEffect(() => {
        const fetchTopicPlan = async () => {
            setTopicPlanLoading(true);
            await getTopicPlanByID(topicPlanID);
            setTopicPlanLoading(false);
        };

        fetchTopicPlan();
    }, [topicPlanID, getTopicPlanByID, setTopicPlanLoading]);

    useEffect(() => {
        if (!topicPlanLoading && !topicPlan) {
            navigation.goBack();
        }
    }, [topicPlanLoading, topicPlan, navigation]);

    const handleLessonPress = async (lessonID: number) => {
        setLessonsLoading(true);
        await getLessonByID(lessonID);  // Fetch the full lesson object
        setLessonsLoading(false);
        navigation.navigate('LessonPage', { lessonID });
    };

    const renderLessonItem = ({ item, index }) => {
        console.log('Rendering lesson item:', item.title, index);
        const isLocked = index > 0 && !topicPlan.lesson[index - 1].completed;  // Assuming 'completed' is part of the lesson metadata

        return (
            <TouchableOpacity
                style={[styles.lessonButton, isLocked && styles.lockedLessonButton]}
                disabled={isLocked}
                onPress={() => handleLessonPress(item.id)}
            >
                <Text style={styles.lessonText}>{item.title}</Text>
                {isLocked && <Text style={styles.lockedText}>Locked</Text>}
            </TouchableOpacity>
        );
    };

    if (topicPlanLoading || !topicPlan) {
        return <ActivityIndicator size="large" color="#000" style={styles.loader} />;
    }

    return (
        <View style={styles.container} testID={props.testID}>
            <Text style={styles.title}>{topicPlan.title}</Text>
            <Text style={styles.objective}>{topicPlan.objective}</Text>
            <FlatList
                data={topicPlan.lesson}
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
        backgroundColor: '#2c22b8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#fff',
    },
    objective: {
        fontSize: 18,
        marginBottom: 20,
        color: '#fff',
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