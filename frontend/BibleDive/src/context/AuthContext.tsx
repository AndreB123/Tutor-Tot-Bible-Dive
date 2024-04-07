import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { getAccessToken } from "../utils/SecureStorage";
import WebSocketService from "../services/WebSocketService";

interface AuthContextType {
    isLoggedIn: boolean;
    checkAuthState: () => Promise<void>;
    establishWebSocket: () => void;
    closeWebSocket: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkAuthState = async () => {
        const token = await getAccessToken();
        const loggedIn = !!token;
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
            establishWebSocket();
        } else {
            closeWebSocket();
        }
    };

    const establishWebSocket = async () => {
        const token = await getAccessToken();
        if (token) {
            const wsUrl = new URL(process.env.EXPO_PUBLIC_WEBSOCKET_URL);
            wsUrl.searchParams.append('token', token);
            WebSocketService.connect(wsUrl.toString());
        }
    };

    const closeWebSocket = () => {
        WebSocketService.disconnect();
    }

    useEffect(() => {
        checkAuthState();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, checkAuthState, establishWebSocket, closeWebSocket }}>
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