import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../feature_pages/LoginScreen";
import { Dashboard } from "../feature_pages/Dashboard";
import { RootStackParamList } from "./Navigationtypes";
import { useAuth } from "../context/AuthContext";
import React, { useEffect } from "react";
import { CreateAccount } from "../feature_pages/CreateAccount";
import { ChatPage } from "../feature_pages/ChatPage";
import { theme } from "../styles/theme";
import { StyleSheet, TouchableOpacity } from "react-native";
import { AccountManagement } from "../feature_pages/AccountManagement";
import Icon from 'react-native-vector-icons/MaterialIcons';


const Stack = createNativeStackNavigator<RootStackParamList>();

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: theme.colors.headerBackground,
        borderBottomWidth: 0,
        borderBottomColor: 'black',
    },
    headerTitleStyle: {
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    iconStyle: {
        marginRight: 10,
    },
});

function AppNavigator() {
    const { isLoggedIn, checkAuthState } = useAuth();

    useEffect(() => {
        checkAuthState();
    }, [checkAuthState]);

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: styles.headerStyle,
                headerTintColor: theme.colors.textPrimary,
                headerTitleStyle: styles.headerTitleStyle,
                headerBackTitleVisible: false,
                headerTitleAlign: 'center',
                headerShadowVisible: false,
            }}
        >
            {isLoggedIn ? (
                <>
                    <Stack.Screen 
                        name="Dashboard" 
                        component={Dashboard} 
                        options={({ navigation }) => ({
                            title: 'Dashboard',
                            headerRight: () => (
                                <TouchableOpacity
                                    style={styles.iconStyle}
                                    onPress={() => navigation.navigate('AccountManagementPage')}
                                >
                                    <Icon name="settings" size={25} color={theme.colors.textPrimary} />
                                </TouchableOpacity>
                            ),
                        })} 
                    />
                    <Stack.Screen 
                        name="ChatPage" 
                        component={ChatPage} 
                        options={{ title: 'Chat' }} 
                    />
                    <Stack.Screen
                        name="AccountManagementPage"
                        component={AccountManagement}
                        options={{ title: 'Account Management'}}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen 
                        name="Login" 
                        component={LoginScreen} 
                        options={{ title: 'Login' }} 
                    />
                    <Stack.Screen 
                        name="CreateAccount" 
                        component={CreateAccount} 
                        options={{ title: 'Create Account' }} 
                    />
                    {/* Add other screens accessible before login here */}
                </>
            )}
        </Stack.Navigator>
    );
}

export default AppNavigator;
