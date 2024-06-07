import React, { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet } from '../styles/useStyles';
import LogoutButton from '../components/LogoutButton';
import { useUser } from '../context/UserContext';
import { useChat } from '../context/ChatContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/Navigationtypes';
import SideBar from '../components/templates/SideBar';

export interface DashboardScreenProps {
    testID?: string;
}

type ChatPageNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'ChatPage'
>;

export const Dashboard: React.FC<DashboardScreenProps> = (props) => {
    const navigation = useNavigation<ChatPageNavigationProp>();
    const { chatSummaries, getChatSummaries } = useChat();

    const styles = createStyleSheet((theme) => ({
        container: {
            flex: 1,
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
        },
    }));

    const { user } = useUser();
    const username = user ? user.user.username : 'Diver';

    useEffect(() => {
        getChatSummaries();
    }, []);

    const handleGetStartedPress = () => {
        navigation.navigate('ChatPage');
    };

    const sidebarData = [
        {
            key: '1',
            title: 'New Chat',
            onPress: handleGetStartedPress,
        },
        ...chatSummaries.map(summary => ({
            key: summary.id.toString(),
            title: summary.name,
            onPress: () => {}, // Placeholder for future implementation
        }))
    ];

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={item.onPress} style={{ padding: 10 }}>
            <Text style={{ color: 'white' }}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} testID={props.testID}>
            <SideBar
                onPress={handleGetStartedPress}
                title="Menu"
                data={sidebarData}
                renderItem={renderItem}
            >
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <Text style={styles.username}>{`Welcome, ${username}`}</Text>
                    <LogoutButton />
                </ScrollView>
            </SideBar>
        </SafeAreaView>
    );
};
