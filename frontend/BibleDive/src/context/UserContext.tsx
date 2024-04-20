import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import UserService from "../services/UserService";
import WebSocketService from "../services/WebSocketService";
import { getUserIDFromToken } from "../utils/SecureStorage";


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
                const id = await getUserIDFromToken();
                setUserID(id);
                if (id) {
                    userService.getUserDetails(id);
                }
            } catch (error) {
                console.error('Failed to load user ID', error);
            }
        };

        loadUserID();
    }, [userService]);
   
    

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