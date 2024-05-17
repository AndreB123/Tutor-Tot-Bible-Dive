import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import UserService from "../services/UserService";
import WebSocketService from "../services/WebSocketService";
import { getUserIDFromToken, getAccessToken } from "../utils/SecureStorage";
import { useAuth } from "./AuthContext";


const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [userID, setUserID] = useState(null);
    const [user, setUser] = useState(null);
    const { isLoggedIn, logoutInitiated } = useAuth();

    useEffect(() => {
        if (logoutInitiated) {
            setUserID(null);
            setUser(null);
        }
    }, [logoutInitiated]);

    const handleUpdateUser = useCallback((userDetails) => {
        setUser(userDetails);
    }, []);

    const userService = useMemo(() => new UserService(WebSocketService, handleUpdateUser), [handleUpdateUser]);

    useEffect(() => {
        const loadUserID = async () => {
            try {
                const jwt = await getAccessToken();
                if (jwt) {
                    const id = await getUserIDFromToken(); 
                    console.log('Loaded userID:', id);
                    setUserID(id);
                    await userService.getUserDetails(id, jwt);
                }
            } catch (error) {
                console.error('Failed to get user details', error);
            }
        };

        if (isLoggedIn) {
            loadUserID();
        }
    }, [isLoggedIn, userService]);

    const value = useMemo(()=> ({
        userID,
        user,
        setUserID,
        setUser,
        fetchUserDetails: userService.getUserDetails
    }), [userID, user, userService]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};


export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};