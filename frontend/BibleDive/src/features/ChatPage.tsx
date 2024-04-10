import { SafeAreaView } from "react-native-safe-area-context"
import { createStyleSheet } from "../styles/useStyles"
import { ScrollView, View } from "react-native";

export interface ChatPageProps {
    testID?: string,
}

export const ChatPage: React.FC<ChatPageProps> = ({testID}) => {
    return (
        <SafeAreaView style={styles.container} testID={testID}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={{height: 20}} />
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
    }
}));