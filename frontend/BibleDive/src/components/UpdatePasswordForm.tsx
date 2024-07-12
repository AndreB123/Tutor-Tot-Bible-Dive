import React, { useEffect, useState } from "react";
import { View, Text } from 'react-native';
import { createStyleSheet } from "../styles/useStyles";
import { InputField } from "./templates/InputField";
import { SubmitButton } from "./SubmitButton";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigationtypes";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { getAccessToken } from "../utils/SecureStorage";

export interface UpdatePasswordFormProps {
    testID?: string,
}

type DashboardNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Dashboard'
>;

export const UpdatePasswordForm: React.FC<UpdatePasswordFormProps> = ({ testID }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [isOldPasswordVerified, setIsOldPasswordVerified] = useState(false);
    const [verifyAttempted, setVerifyAttempted] = useState(false);
    const navigation = useNavigation<DashboardNavigationProp>();
    const { checkAuthState } = useAuth();
    const { userID, verifyPassword, updatePassword, passwordVerifySuccess } = useUser();

    useEffect(() => {
        if (verifyAttempted) {
            if (passwordVerifySuccess) {
                setIsOldPasswordVerified(true);
                setError('');
            } else {
                setError('Old password is incorrect.');
                setIsOldPasswordVerified(false);
            }
            setVerifyAttempted(false);
        }
    }, [passwordVerifySuccess, verifyAttempted]);

    const validatePassword = (password: string): boolean => {
        const hasTenCharacters = password.length >= 10;
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasTenCharacters && hasSymbol;
    };

    const passwordsMatch = (password: string, confirmPassword: string): boolean => {
        return password === confirmPassword;
    };

    const handleVerifyOldPassword = async () => {
        if (!oldPassword) {
            setError('Please enter your old password.');
            return;
        }

        setVerifyAttempted(true);
        const jwt = await getAccessToken();
        verifyPassword(userID, oldPassword, jwt);
    };

    const handleSubmitPress = async () => {
        if (!isOldPasswordVerified) {
            setError('Please verify your old password first.');
            return;
        }

        if (!validatePassword(newPassword)) {
            setError('Password must be at least 10 characters long and include at least one symbol.');
            setNewPassword('');
            setConfirmNewPassword('');
            return;
        }

        if (!passwordsMatch(newPassword, confirmNewPassword)) {
            setError('Passwords do not match.');
            setNewPassword('');
            setConfirmNewPassword('');
            return;
        }

        const jwt = await getAccessToken();
        const isSuccess = await updatePassword(userID, newPassword, jwt);
        if (isSuccess) {
            await checkAuthState();
            navigation.navigate('Dashboard');
        } else {
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setError('Failed to update password. Try again later.');
        }
    };

    const clearError = () => setError('');

    return (
        <View style={styles.root} testID={testID}>
            <Text style={styles.updatePassword} testID="56:578">
                {`Update Password`}
            </Text>
            <Text style={styles.password} testID="56:580">
                {`Old Password`}
            </Text>
            <InputField testID="56:576"
                value={oldPassword}
                onChangeText={(text) => { clearError(); setOldPassword(text); }}
                placeholder="Old Password"
                onSubmitEditing={handleVerifyOldPassword}
                style={styles.inputField}
                 />
            <SubmitButton onPress={handleVerifyOldPassword} testID="56:579" />
            <Text style={styles.password} testID="56:580">
                {`New Password`}
            </Text>
            <InputField testID="56:576"
                value={newPassword}
                onChangeText={(text) => { clearError(); setNewPassword(text); }}
                placeholder="New Password"
                onSubmitEditing={handleSubmitPress}
                style={styles.inputField}
                 />
            <Text style={styles.confirmPassword} testID="56:581">
                {`Confirm New Password`}
            </Text>
            <InputField testID="56:577"
                value={confirmNewPassword}
                onChangeText={(text) => { clearError(); setConfirmNewPassword(text); }}
                placeholder="Confirm New Password"
                secureTextEntry
                onSubmitEditing={handleSubmitPress}
                style={styles.inputField}
                 />
                
            {error ? <Text style={styles.errors}>{error}</Text> : null}
            <Text style={styles.passwordInfo} testID="56:583">
                {`Password must contain: \n* At least 10 characters\n* At least 1 symbol`}
            </Text>
            <SubmitButton onPress={handleSubmitPress} testID="56:582" />
        </View>
    )
}


const styles = createStyleSheet(theme => ({
    root: {
        paddingTop: 20,
        paddingLeft: 13,
        paddingRight: 13,
        paddingBottom: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: 10,
        columnGap: 15,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: theme.colors.foreground,
        backgroundColor: theme.colors.secondaryBackground,
    },
    updatePassword: {
        width: 211,
        height: 29,
        color: theme.colors.textPrimary,
        textShadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
        textAlign: 'center',
        textShadowRadius: 4,
        textShadowOffset: { "width": 0, "height": 4 },
        fontFamily: 'Inter',
        fontSize: 24,
        fontStyle: 'normal',
        fontWeight: '500',
    },
    password: {
        width: 135,
        height: 18,
        flexDirection: 'column',
        color: theme.colors.textPrimary,
        textShadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
        textShadowRadius: 4,
        textShadowOffset: { "width": 0, "height": 4 },
        fontFamily: 'Inter',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '500',
    },
    confirmPassword: {
        width: 135,
        height: 18,
        flexDirection: 'column',
        color: theme.colors.textPrimary,
        textShadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
        textShadowRadius: 4,
        textShadowOffset: { "width": 0, "height": 4 },
        fontFamily: 'Inter',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '500',
    },
    passwordInfo: {
        width: 200,
        height: 50,
        color: theme.colors.textPrimary,
        textShadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
        textShadowRadius: 4,
        textShadowOffset: { "width": 0, "height": 4 },
        fontFamily: 'Inter',
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '500',
    },
    errors: {
        color: theme.colors.errors,
        margin: 10,
    },
    inputField: {
        paddingLeft: 10,
    }
}));
