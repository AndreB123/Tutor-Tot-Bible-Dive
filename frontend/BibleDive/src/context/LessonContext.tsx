import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import WebSocketService from "../services/WebSocketService";
import LessonService from "../services/LessonService";
import { getAccessToken } from "../utils/SecureStorage";
import { Lesson } from "../models/LessonModels"; // Import Lesson model

interface LessonContextType {
    lessons: Lesson[] | null;
    setLessons: (lessons: Lesson[]) => void;
    generateLessons: (topicPlanID: number) => Promise<Lesson[] | null>;
    getAllLessonsByTopicID: (topicPlanID: number) => Promise<void>;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

interface LessonProviderProps {
    children: ReactNode;
}

const LessonContext = createContext<LessonContextType | null>(null);

export const LessonProvider: React.FC<LessonProviderProps> = ({ children }) => {
    const [lessons, setLessons] = useState<Lesson[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleLessonsGenerated = useCallback((lessons: Lesson[]) => {
        setLessons(lessons);
    }, []);

    const handleLessonsFetched = useCallback((lessons: Lesson[]) => {
        setLessons(lessons);
    }, []);

    const lessonService = useMemo(() => new LessonService(
        WebSocketService,
        handleLessonsGenerated,
        handleLessonsFetched
    ), [handleLessonsGenerated, handleLessonsFetched]);

    const generateLessons = useCallback(async (topicPlanID: number): Promise<Lesson[] | null> => {
        try {
            setLoading(true);
            const jwt = await getAccessToken();
            if (jwt) {
                const lessons = await lessonService.generateLessons(topicPlanID, jwt);
                handleLessonsGenerated(lessons);
                return lessons;  // Return the lessons object
            }
        } catch (error) {
            console.error("Failed to generate lessons:", error);
        } finally {
            setLoading(false);
        }
        return null;  // Return null if something goes wrong
    }, [lessonService, handleLessonsGenerated]);

    const getAllLessonsByTopicID = useCallback(async (topicPlanID: number) => {
        try {
            setLoading(true);
            const jwt = await getAccessToken();
            if (jwt) {
                await lessonService.getAllLessonsByTopicID(topicPlanID, jwt);
            }
        } catch (error) {
            console.error("Failed to fetch lessons:", error);
            setLoading(false);
        }
    }, [lessonService]);

    const value = useMemo(() => ({
        lessons,
        setLessons,
        generateLessons,
        getAllLessonsByTopicID,
        loading,
        setLoading
    }), [lessons, generateLessons, getAllLessonsByTopicID, loading, setLoading]);

    return (
        <LessonContext.Provider value={value}>
            {children}
        </LessonContext.Provider>
    );
};

export const useLesson = () => {
    const context = useContext(LessonContext);
    if (context === null) {
        throw new Error('useLesson must be used within a LessonProvider');
    }
    return context;
};
