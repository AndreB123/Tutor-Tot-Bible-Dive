import { SafeAreaView } from "react-native-safe-area-context"
import { createStyleSheet } from "../styles/useStyles"
import ChatScreen from "../components/ChatScreen";

export interface ChatPageProps {
    testID?: string,
}

export const ChatPage: React.FC<ChatPageProps> = ({testID}) => {
    return (
        <SafeAreaView style={styles.container} testID={testID}>
            <ChatScreen/>
        </SafeAreaView>
    )
}

const styles = createStyleSheet(theme => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primaryBackground,
    },
 
}));