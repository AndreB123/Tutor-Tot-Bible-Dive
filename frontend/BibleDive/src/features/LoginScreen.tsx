import { Login } from "../components/Login";
import { SafeAreaView, ScrollView, View } from "react-native";
import { createStyleSheet } from "../styles/useStyles"

export interface LoginScreenProps {
    testID?: string,
  }

export const LoginScreen = (props: LoginScreenProps) => {
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

    return (
            <SafeAreaView style={styles.container} testID={props.testID}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={{ height: 20 }} />
                    <Login />
                </ScrollView>
            </SafeAreaView>
    );
};