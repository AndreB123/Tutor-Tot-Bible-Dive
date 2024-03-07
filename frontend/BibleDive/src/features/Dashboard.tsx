import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createStyleSheet } from "styles/useStyles"

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
    }));

    return (
        <SafeAreaView style={styles.container} testID={props.testID}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    )
}