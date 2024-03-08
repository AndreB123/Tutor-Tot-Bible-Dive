import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { getAccessToken } from "../utils/SecureStorage";
import WebSocketService from "../services/WebSocketService";
import config from "../config/config";

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

    const establishWebSocket = () => {
        WebSocketService.connect(config.webSocketUrl)
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