import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LessonPrompt } from "../components/LessonPrompt";
import { LessonOptions } from "../components/LessonOptions";


export interface LessonPageScreenProps {
    testID?: string;
}

export const LessonPage: React.FC<LessonPageScreenProps> = (props) => {
    return (
        <SafeAreaView edges={[]} testID={props.testID}>
            <LessonPrompt />
            <LessonOptions />
        </SafeAreaView>
    );
};
