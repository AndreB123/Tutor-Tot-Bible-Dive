import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface LessonPageScreenProps {
    testID?: string;
}

export const LessonPage: React.FC<LessonPageScreenProps> = (props) => {
    return (
        <SafeAreaView style={styles.container} edges={[]} testID={props.testID}>
        
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ff66',
    },
});
