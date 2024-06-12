import { SafeAreaView } from "react-native-safe-area-context"
import { createStyleSheet } from "../styles/useStyles"
import ChatScreen from "../components/ChatScreen";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/Navigationtypes";

export interface ChatPageProps {
    testID?: string,
}

type ChatPageRouteProp = RouteProp<RootStackParamList, 'ChatPage'>;

export const ChatPage: React.FC<ChatPageProps> = ({testID}) => {
    const route = useRoute<ChatPageRouteProp>();
    const { chatID } = route.params;

    return (
        <SafeAreaView style={styles.container} testID={testID}>
            <ChatScreen initialChatId={chatID}/>
        </SafeAreaView>
    )
}

const styles = createStyleSheet(theme => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primaryBackground,
    },
 
}));