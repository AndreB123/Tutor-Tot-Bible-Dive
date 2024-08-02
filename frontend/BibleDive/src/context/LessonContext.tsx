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
    getOrGenerateLessonByID: (topicPlanID: number, lessonID: number) => Promise<Lesson | null>; // New method
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

    const getOrGenerateLessonByID = useCallback(async (topicPlanID: number, lessonID: number): Promise<Lesson | null> => {
        try {
            setLoading(true);
            const jwt = await getAccessToken();
            if (jwt) {
                const lesson = await lessonService.getLessonByID(topicPlanID, lessonID, jwt);
                if (!lesson.information) {
                    const generatedLessons = await generateLessons(topicPlanID);
                    const updatedLesson = generatedLessons?.find(l => l.id === lessonID) || null;
                    return updatedLesson;
                }
                return lesson;
            }
        } catch (error) {
            console.error("Failed to get or generate lesson:", error);
        } finally {
            setLoading(false);
        }
        return null;
    }, [lessonService, generateLessons]);

    const value = useMemo(() => ({
        lessons,
        setLessons,
        generateLessons,
        getOrGenerateLessonByID,
        getAllLessonsByTopicID,
        loading,
        setLoading
    }), [lessons, generateLessons, getOrGenerateLessonByID, getAllLessonsByTopicID, loading, setLoading]);

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
