import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../features/LoginScreen";
import { Dashboard } from "../features/Dashboard";
import { RootStackParamList } from "./Navigationtypes";
import { useAuth } from "../services/AuthContext";
import { useEffect } from "react";
import { CreateAccount } from "../features/CreateAccount";

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
    const { isLoggedIn, checkAuthState } = useAuth();

    useEffect(() => {
        const bootstrapAsync = async () => {
            await checkAuthState;
        };

        bootstrapAsync();
    }, [checkAuthState]);

    return (
        <Stack.Navigator>
            {isLoggedIn ? (
                <Stack.Screen name="Dashboard" component={Dashboard} />
            ) : (
                <Stack.Screen name="Login" component={LoginScreen} />
            )}
            <Stack.Screen name="CreateAccount" component={CreateAccount} />
        </Stack.Navigator>
    );
}

export default AppNavigator;