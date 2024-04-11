import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import UserService from "../services/UserService";
import WebSocketService from "../services/WebSocketService";
import { getUserIDFromToken } from "../utils/SecureStorage";


const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [userID, setUserID] = useState(null);
    const [user, setUser] = useState(null);

    const userService = new UserService(WebSocketService);

    useEffect(() => {
        const loadUserID = async () => {
            try {
                const id = await getUserIDFromToken();
                setUserID(id);
                if (id) {
                    fetchUserDetails(id);
                }
            } catch (error) {
                console.error('Failed to load user ID', error);
            }
        };

        loadUserID();
    }, []);
   
    const fetchUserDetails = useCallback(async (userID) => {
        try {
        const userDetails = userService.getUserDetails(userID);
        setUser(userDetails);
        } catch (error ) {
            console.error('Failed to fetch user details', error);
        }
    }, [userService]);

    const value = useMemo(()=> ({
        userID,
        user,
        fetchUserDetails
    }), [userID, user, fetchUserDetails]);

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