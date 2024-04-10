import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createStyleSheet } from "../styles/useStyles";
import { CreateAccountForm } from "../components/CreateAccountForm";


export interface CreateAccountProps {
    testID?: string,
}

export const CreateAccount: React.FC<CreateAccountProps> = ({testID}) => {
    return (
        <SafeAreaView style={styles.container} testID={testID}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={{height: 20}} />
                <CreateAccountForm />
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = createStyleSheet(theme => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primaryBackground,
    },
    contentContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
}));
