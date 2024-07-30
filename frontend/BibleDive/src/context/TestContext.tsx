import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import WebSocketService from "../services/WebSocketService";
import TestService from "../services/TestService";
import { getAccessToken } from "../utils/SecureStorage";
import { Test } from "../models/TestModels"; // Import Test model

interface TestContextType {
    test: Test | null;
    setTest: (test: Test) => void;
    generateTest: (lessonID: number, numMultipleChoice: number, numFillInTheBlank: number, numShortAnswer: number, numMatchOptions: number) => Promise<Test | null>;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

interface TestProviderProps {
    children: ReactNode;
}

const TestContext = createContext<TestContextType | null>(null);

export const TestProvider: React.FC<TestProviderProps> = ({ children }) => {
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleTestGenerated = useCallback((test: Test) => {
        setTest(test);
    }, []);

    const testService = useMemo(() => new TestService(
        WebSocketService,
        handleTestGenerated
    ), [handleTestGenerated]);

    const generateTest = useCallback(async (lessonID: number, numMultipleChoice: number, numFillInTheBlank: number, numShortAnswer: number, numMatchOptions: number): Promise<Test | null> => {
        try {
            setLoading(true);
            const jwt = await getAccessToken();
            if (jwt) {
                const test = await testService.generateTest(lessonID, numMultipleChoice, numFillInTheBlank, numShortAnswer, numMatchOptions, jwt);
                handleTestGenerated(test);
                return test;  // Return the test object
            }
        } catch (error) {
            console.error("Failed to generate test:", error);
        } finally {
            setLoading(false);
        }
        return null;  // Return null if something goes wrong
    }, [testService, handleTestGenerated]);

    const value = useMemo(() => ({
        test,
        setTest,
        generateTest,
        loading,
        setLoading
    }), [test, generateTest, loading, setLoading]);

    return (
        <TestContext.Provider value={value}>
            {children}
        </TestContext.Provider>
    );
};

export const useTest = () => {
    const context = useContext(TestContext);
    if (context === null) {
        throw new Error('useTest must be used within a TestProvider');
    }
    return context;
};
