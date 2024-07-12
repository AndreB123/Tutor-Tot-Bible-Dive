import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import UserService from "../services/UserService";
import WebSocketService from "../services/WebSocketService";
import { getUserIDFromToken, getAccessToken } from "../utils/SecureStorage";
import { useAuth } from "./AuthContext";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [userID, setUserID] = useState(null);
    const [user, setUser] = useState(null);
    const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(null);
    const [passwordVerifySuccess, setPasswordVerifySuccess] = useState(null);
    const [userDeletionSuccess, setUserDeletionSuccess] = useState(null);
    const { isLoggedIn, logoutInitiated, logout } = useAuth();

    useEffect(() => {
        if (logoutInitiated) {
            setUserID(null);
            setUser(null);
        }
    }, [logoutInitiated]);

    const handleUpdateUser = useCallback((userDetails) => {
        setUser(userDetails);
    }, []);

    const handleUpdatePassword = useCallback((success) => {
        setPasswordUpdateSuccess(success);
    }, []);

    const handleVerifyPassword = useCallback((success) => {
        setPasswordVerifySuccess(success);
    }, []);

    const handleDeleteUser = useCallback((success) => {
        setUserDeletionSuccess(success);
        if (success) {
            logout();
        }
    }, [logout]);

    const userService = useMemo(() => new UserService(
        WebSocketService, 
        handleUpdateUser, 
        handleUpdatePassword, 
        handleVerifyPassword, 
        handleDeleteUser
    ), [handleUpdateUser, handleUpdatePassword, handleVerifyPassword, handleDeleteUser]);

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

    const value = useMemo(() => ({
        userID,
        user,
        passwordUpdateSuccess,
        passwordVerifySuccess,
        userDeletionSuccess,
        setUserID,
        setUser,
        fetchUserDetails: userService.getUserDetails,
        updatePassword: userService.updatePassword,
        verifyPassword: userService.verifyPassword,
        deleteUser: userService.deleteUser,
    }), [userID, user, passwordUpdateSuccess, passwordVerifySuccess, userDeletionSuccess, userService]);

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
