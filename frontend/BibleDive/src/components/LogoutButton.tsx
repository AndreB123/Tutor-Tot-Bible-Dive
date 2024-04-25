import React from "react";
import { TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useAuth } from "../context/AuthContext"

const LogoutButton = () => {
    const { logout } = useAuth();

    return (

        <TouchableOpacity onPress={logout}>
            <Icon name="logout" size={30} color="#FFF" />
        </TouchableOpacity>

    );
};

export default LogoutButton;