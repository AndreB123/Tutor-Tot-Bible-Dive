import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../features/LoginScreen";
import { Dashboard } from "../features/Dashboard";
import { RootStackParamList } from "./Navigationtypes";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { CreateAccount } from "../features/CreateAccount";
import { ChatPage } from "../features/ChatPage";
import { theme } from "../styles/theme";
import { StyleSheet } from "react-native";

const Stack = createNativeStackNavigator<RootStackParamList>();

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: theme.colors.headerBackground,
        borderBottomWidth: 2,
        borderBottomColor: 'black',
    },
    headerTitleStyle: {
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
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
                        options={{ title: 'Dashboard' }} 
                    />
                    <Stack.Screen 
                        name="ChatPage" 
                        component={ChatPage} 
                        options={{ title: 'Chat' }} 
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
