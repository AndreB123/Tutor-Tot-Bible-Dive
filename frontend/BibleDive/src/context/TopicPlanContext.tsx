import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import WebSocketService from "../services/WebSocketService";
import TopicPlanService from "../services/TopicPlanService";
import { getAccessToken } from "../utils/SecureStorage";
import { TopicPlan, TopicPlans } from "../models/TopicPlanModels";

interface TopicPlanContextType {
    topicPlan: TopicPlan | null;
    topicPlans: TopicPlans | null;
    topicPlanOverview: string;
    setTopicPlan: (plan: TopicPlan) => void;
    setTopicPlans: (plans: TopicPlans) => void;
    generateTopicPlan: (userID: string, prompt: string, numberOfLessons: number) => Promise<TopicPlan | null>;
    getAllTopicPlansByUID: (userID: string) => Promise<void>;
    generateTopicPlanOverview: (userID: string, prompt: string) => Promise<void>;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    setTopicPlanOverview: (topicPlanOverview: string) => void; 
}

interface TopicPlanProviderProps {
    children: ReactNode;
}

const TopicPlanContext = createContext<TopicPlanContextType | null>(null);

export const TopicPlanProvider: React.FC<TopicPlanProviderProps> = ({ children }) => {
    const [topicPlan, setTopicPlan] = useState<TopicPlan | null>(null);
    const [topicPlans, setTopicPlans] = useState<TopicPlans | null>(null);
    const [topicPlanOverview, setTopicPlanOverview] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleTopicPlanGenerated = useCallback((plan: TopicPlan) => {
        setTopicPlan(plan);
    }, []);

    const handleTopicPlansFetched = useCallback((plans: TopicPlans) => {
        setTopicPlans(plans);
    }, []);

    const handleTopicPlanOverviewGenerated = useCallback((overview: string) => {
        setTopicPlanOverview(overview);
        setLoading(false);
    }, []);

    const topicPlanService = useMemo(() => new TopicPlanService(
        WebSocketService,
        handleTopicPlanGenerated,
        handleTopicPlansFetched,
        handleTopicPlanOverviewGenerated
    ), [handleTopicPlanGenerated, handleTopicPlansFetched, handleTopicPlanOverviewGenerated]);

    const generateTopicPlan = useCallback(async (userID: string, prompt: string, numberOfLessons: number): Promise<TopicPlan | null> => {
        try {
            setLoading(true);
            const jwt = await getAccessToken();
            if (jwt) {
                const topicPlan = await topicPlanService.generateTopicPlan(userID, prompt, numberOfLessons, jwt);
                handleTopicPlanGenerated(topicPlan);
                return topicPlan;  // Return the topic plan object
            }
        } catch (error) {
            console.error("Failed to generate topic plan:", error);
        } finally {
            setLoading(false);
        }
        return null;  // Return null if something goes wrong
    }, [topicPlanService, handleTopicPlanGenerated]);
    
    const getAllTopicPlansByUID = useCallback(async (userID: string) => {
        try {
            setLoading(true);
            const jwt = await getAccessToken();
            if (jwt) {
                await topicPlanService.getAllTopicPlansByUID(userID, jwt);
            }
        } catch (error) {
            console.error("Failed to fetch topic plans:", error);
            setLoading(false);
        }
    }, [topicPlanService]);

    const generateTopicPlanOverview = useCallback(async (userID: string, prompt: string) => {
        try {
            setLoading(true);
            const jwt = await getAccessToken();
            if (jwt) {
                await topicPlanService.generateTopicPlanOverview(userID, prompt, jwt);
            }
        } catch (error) {
            console.error("Failed to generate topic plan overview:", error);
            setLoading(false);
        }
    }, [topicPlanService]);

    const value = useMemo(() => ({
        topicPlan,
        topicPlans,
        topicPlanOverview,
        setTopicPlan,
        setTopicPlans,
        generateTopicPlan,
        getAllTopicPlansByUID,
        generateTopicPlanOverview,
        loading,
        setLoading,
        setTopicPlanOverview
    }), [topicPlan, topicPlans, topicPlanOverview, setTopicPlan, setTopicPlans, generateTopicPlan, getAllTopicPlansByUID, generateTopicPlanOverview, loading,  setLoading, setTopicPlanOverview]);

    return (
        <TopicPlanContext.Provider value={value}>
            {children}
        </TopicPlanContext.Provider>
    );
};

export const useTopicPlan = () => {
    const context = useContext(TopicPlanContext);
    if (context === null) {
        throw new Error('useTopicPlan must be used within a TopicPlanProvider');
    }
    return context;
};
