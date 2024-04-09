import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createStyleSheet } from "../styles/useStyles"
import LogoutButton from "../components/LogoutButton";

export interface DashbaordScreenProps {
    testID?: string,
}

export const Dashboard = (props: DashbaordScreenProps) => {
    const styles = createStyleSheet(theme => ({
        container: {
            flex:1,
            backgroundColor: theme.colors.primaryBackground,
        },
        contentContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 20,
        },
        username: {
            fontSize: 20,
            marginBottom: 20,
        }
    }));

    const username = 'User';

    return (
        <SafeAreaView style={styles.container} testID={props.testID}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.username}>{`Welcome, ${username}`}</Text>
                <LogoutButton />
            </ScrollView>
        </SafeAreaView>
    )
}