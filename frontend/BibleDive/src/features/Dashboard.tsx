import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet } from '../styles/useStyles';
import LogoutButton from '../components/LogoutButton';
import { useUser } from '../context/UserContext';
import { useChat } from '../context/ChatContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/Navigationtypes';
import SideBar from '../components/templates/SideBar';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ConfirmationOverlay from '../components/templates/ConfirmationOverlay';

export interface DashboardScreenProps {
    testID?: string;
}

type ChatPageNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'ChatPage'
>;

export const Dashboard: React.FC<DashboardScreenProps> = (props) => {
    const navigation = useNavigation<ChatPageNavigationProp>();
    const { getChatSummaries, getRecentMessages, deleteChatByID, chats } = useChat();
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<number | null>(null);
    const sidebarRef = useRef<any>(null);

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
        sidebarItem: {
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        sidebarText: {
            color: 'white',
        },
        fixedItemContainer: {
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
        },
        scrollableContainer: {
            flexGrow: 1,
        },
    }));

    const { user } = useUser();
    const username = user ? user.user.username : 'Diver';
    const userID = user ? user.user.id : null;

    useEffect(() => {
        if (userID) {
            getChatSummaries(userID);
        }
    }, [userID]);

    useFocusEffect(
        useCallback(() => {
            if (sidebarRef.current) {
                sidebarRef.current.closeSidebar();  // Close the sidebar when the screen comes into focus
            }
        }, [])
    );

    const handleGetStartedPress = () => {
        navigation.navigate('ChatPage', { chatID: 0 });
    };

    const handleChatPress = async (chatID: number) => {
        try {
            await getRecentMessages(chatID);
            navigation.navigate('ChatPage', { chatID });
        } catch (error) {
            console.error('Failed to get recent messages', error);
        }
    };

    const handleDeletePress = (chatID: number) => {
        setChatToDelete(chatID);
        setOverlayVisible(true);
    };

    const handleConfirmDelete = async () => {
        if (chatToDelete !== null) {
            try {
                await deleteChatByID(chatToDelete, userID);
                setOverlayVisible(false);
                setChatToDelete(null);
            } catch (error) {
                console.error('Failed to delete chat', error);
            }
        }
    };

    const newChatItem = {
        key: '1',
        title: 'New Chat',
        onPress: handleGetStartedPress,
        icon: 'chat-plus'
    };
    
    const chatItems = chats.map(chat => ({
        key: chat.id.toString(),
        title: chat.name,
        onPress: () => handleChatPress(chat.id),
        icon: 'chatbox-outline' 
    }));
    
    const sidebarData = useMemo(() => chatItems, [chats, handleChatPress]);
    
    const renderNewChatItem = useCallback(() => (
        <TouchableOpacity onPress={newChatItem.onPress} style={styles.sidebarItem}>
            <MaterialIcons name={newChatItem.icon} size={20} color="white" style={{ marginRight: 10 }} />
            <Text style={styles.sidebarText}>{newChatItem.title}</Text>
        </TouchableOpacity>
    ), [newChatItem, styles.sidebarItem, styles.sidebarText]);

    const renderChatItem = useCallback(({ item }) => (
        <View style={styles.sidebarItem}>
            <TouchableOpacity onPress={item.onPress} style={{ flex: 1 }}>
                <Text style={styles.sidebarText}>{item.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeletePress(item.key)}>
                <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>
        </View>
    ), [styles.sidebarItem, styles.sidebarText]);

    return (
        <SafeAreaView style={styles.container} testID={props.testID}>
            <SideBar
                 ref={sidebarRef}
                onPress={handleGetStartedPress}
                title="Menu"
                data={sidebarData}
                renderItem={renderChatItem}
                fixedItem={renderNewChatItem()}
            >
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <Text style={styles.username}>{`Welcome, ${username}`}</Text>
                    <LogoutButton />
                </ScrollView>
            </SideBar>
            <ConfirmationOverlay
                visible={overlayVisible}
                message="Are you sure you want to delete this chat?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setOverlayVisible(false)}
            />
        </SafeAreaView>
    );
};
