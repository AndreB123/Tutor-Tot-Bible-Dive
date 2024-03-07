import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { getAccessToken } from "utils/SecureStorage";

interface AuthContextType{
    isLoggedIn: boolean;
    checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: {children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkAuthState = async () => {
        const token = await getAccessToken();
        setIsLoggedIn(!!token);
    };

    useEffect(() => {
        checkAuthState();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, checkAuthState }}>
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