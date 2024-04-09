import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from "react";
import { clearTokens, getAccessToken } from "../utils/SecureStorage";
import WebSocketService from "../services/WebSocketService";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigationtypes";

interface AuthContextType {
    isLoggedIn: boolean;
    checkAuthState: () => Promise<void>;
    establishWebSocket: () => void;
    closeWebSocket: () => void;
    logout: () => void;
}

type LoginNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Login'
>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigation = useNavigation<LoginNavigationProp>();

    const logout = async () => {
        await clearTokens();
        setIsLoggedIn(false);
        closeWebSocket();
        navigation.navigate('Login');
    };

    const checkAuthState = async () => {
        const token = await getAccessToken();
        const loggedIn = !!token;
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
            establishWebSocket();
        } else {
            await logout();
        }
    };

    const establishWebSocket = async () => {
        const token = await getAccessToken();
        if (token) {
            const wsUrl = new URL(process.env.EXPO_PUBLIC_WEBSOCKET_URL);
            wsUrl.searchParams.append('token', token);
            WebSocketService.connect(wsUrl.toString());
        } else {
            await logout();
        }
    };

    const closeWebSocket = () => {
        WebSocketService.disconnect();
    }

    useEffect(() => {
        checkAuthState();
    }, []);

    const value = useMemo(() => ({
        isLoggedIn,
        checkAuthState,
        establishWebSocket,
        closeWebSocket,
        logout
    }), [isLoggedIn, checkAuthState, establishWebSocket, closeWebSocket, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};