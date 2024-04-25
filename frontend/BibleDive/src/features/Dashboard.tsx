import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createStyleSheet } from "../styles/useStyles"
import LogoutButton from "../components/LogoutButton";
import { useUser } from "../context/UserContext";
import BaseButton from "../components/templates/BaseButton";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigationtypes";

export interface DashbaordScreenProps {
    testID?: string,
}

type ChatPageNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'ChatPage'
>;

export const Dashboard = (props: DashbaordScreenProps) => {
    const navigation = useNavigation<ChatPageNavigationProp>();

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
            color: '#fff',
        }
    }));

    const { user } = useUser();
    const username = user ? user.name : 'Diver';

    const handleGetStartedPress = () => {
        navigation.navigate('ChatPage');
    };

    return (
        <SafeAreaView style={styles.container} testID={props.testID}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.username}>{`Welcome, ${username}`}</Text>
                <LogoutButton />
                <BaseButton
                    title="Get started"
                    onPress={handleGetStartedPress}
                    style={{}}
                    textStyle={{}}
                    />
            </ScrollView>
        </SafeAreaView>
    )
}