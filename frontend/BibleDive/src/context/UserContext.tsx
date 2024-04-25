import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import UserService from "../services/UserService";
import WebSocketService from "../services/WebSocketService";
import { getUserIDFromToken, getAccessToken } from "../utils/SecureStorage";


const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [userID, setUserID] = useState(null);
    const [user, setUser] = useState(null);

    const handleUpdateUser = useCallback((userDetails) => {
        setUser(userDetails);
    }, []);

    const userService = useMemo(() => new UserService(WebSocketService, handleUpdateUser), [handleUpdateUser]);

    useEffect(() => {
        const loadUserID = async () => {
            try {
                const jwt = await getAccessToken();
                const id = await getUserIDFromToken()
                setUserID(id);
                if (jwt) {
                    userService.getUserDetails(id, jwt);
                }
            } catch (error) {
                console.error('Failed to get user details', error);
            }
        };

        loadUserID();
    }, [userID, userService]);

    

    const value = useMemo(()=> ({
        userID,
        user,
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