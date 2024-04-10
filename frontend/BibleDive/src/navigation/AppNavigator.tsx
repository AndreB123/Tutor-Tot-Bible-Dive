import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../features/LoginScreen";
import { Dashboard } from "../features/Dashboard";
import { RootStackParamList } from "./Navigationtypes";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { CreateAccount } from "../features/CreateAccount";
import { ChatPage } from "../features/ChatPage";

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
    const { isLoggedIn, checkAuthState } = useAuth();

    useEffect(() => {
            checkAuthState();
        }, [checkAuthState]);


    return (
        <Stack.Navigator>
            {isLoggedIn ? (
                <>
                    <Stack.Screen name="Dashboard" component={Dashboard} />
                    <Stack.Screen name="ChatPage" component={ChatPage} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="CreateAccount" component={CreateAccount} />
                    {/* Add other screens accessible before login here */}
                </>
            )}
        </Stack.Navigator>
    );
}

export default AppNavigator;