import React, { createContext, useContext, useMemo, useState } from "react";
import UserService from "../services/UserService";
import WebSocketService from "../services/WebSocketService";


const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);


    const userService = new UserService(WebSocketService);
   
    const fetchUserDetails = async (userID) => {
        const userDetails = userService.getUserDetails(userID);
        setUser(userDetails);
    }

    const value = useMemo(()=> ({
        user,
        fetchUserDetails
    }), [user, fetchUserDetails]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);