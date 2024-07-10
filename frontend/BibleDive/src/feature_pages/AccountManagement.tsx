import React, { useRef, useState } from "react";
import { createStyleSheet } from "../styles/useStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import SideBar from "../components/templates/SideBar";
import AccountDeletion from "../components/DeleteAccountForm";
import { TouchableOpacity, View, Text } from "react-native";
import DeleteAllChats from "../components/DeleteAllChatsForm";
import { UpdatePasswordForm } from "../components/UpdatePasswordForm";

export interface AccountManagementScreenProps {
    testID?: string;
}

export const AccountManagement: React.FC<AccountManagementScreenProps> = (props) => {
    const sidebarRef = useRef<any>(null);
    const [activeComponent, setActiveComponent] = useState<string>("");
    

    const styles = createStyleSheet((theme) => ({
        container: {
            flexGrow: 1,
            backgroundColor: theme.colors.primaryBackground,
        },
        contentContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
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


    const handleSidebarPress = (id: string) => {
        setActiveComponent(id);
        if (sidebarRef.current) {
            sidebarRef.current.closeSidebar();
        }
    };


    const renderComponent = () => {
        switch (activeComponent) {
            // case 'updatePassword':
            //     return <UpdatePasswordForm />;
            case 'deleteAllChats':
                return <DeleteAllChats />;
            case 'deleteAccount':
                return <AccountDeletion />;
            // Add cases for other components here
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={[]} testID={props.testID}>
             <SideBar
                ref={sidebarRef}
                onPress={handleSidebarPress}
                title="Account Management"
                data={[
                    // { id: 'updatePassword', label: 'Update Password' },
                    { id: 'deleteAllChats', label: 'Delete All Chats' },
                    { id: 'deleteAccount', label: 'Delete Account' },
                    // Add other sidebar items here
                ]}
                initialOpen={true}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.sidebarItem}
                        onPress={() => handleSidebarPress(item.id)}
                    >
                        <Text style={styles.sidebarText}>{item.label}</Text>
                    </TouchableOpacity>
                )}
            >
                <View style={styles.contentContainer}>
                    {renderComponent()}
                </View>
            </SideBar>
        </SafeAreaView>
    );
};