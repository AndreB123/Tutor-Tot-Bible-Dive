import React, { useState } from "react";
import { View, Text } from 'react-native';
import { createStyleSheet } from "../styles/useStyles";
import { InputField } from "./InputField";
import { SubmitButton } from "./SubmitButton";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigationtypes";
import { createAccount } from "../services/AuthService";
import { useAuth } from "../context/AuthContext";

export interface CreateAccountFormProps {
    testID?: string,
}

type DashboardNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Dashboard'
>;

export const CreateAccountForm: React.FC<CreateAccountFormProps> = ({ testID }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation<DashboardNavigationProp>();
    const { checkAuthState } = useAuth();

    const validateEmail = (email: string): boolean => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const validatePassword = (password: string): boolean => {
        const hasTenCharacters = password.length >= 10;
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasTenCharacters && hasSymbol;
    };

    const passwordsMatch = (password: string, confirmPassword: string): boolean => {
        return password === confirmPassword;
    };

    const handleSubmitPress = async () => {

        if (!validateEmail(email)) {
            setError('Invalid Email.');
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            return;
        }

        if (!validatePassword(password)) {
            setError('Password must be at least 10 characters long and include at least one symbol.');
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            return;
        }

        if (!passwordsMatch(password, confirmPassword)) {
            setError('Passwords do not match.');
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            return;
        }

        const isSuccess = await createAccount(email, username, password);
        if (isSuccess) {
            await checkAuthState();
            navigation.navigate('Dashboard')
        } else {
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            setError('Failed to create account. Try again later.');
        }
    };

    const clearError = () => setError('');

    return (
        <View style={styles.root} testID={testID}>
            <Text style={styles.createAccount} testID="56:578">
                {`Create Account`}
            </Text>
            <Text style={styles.email} testID="56:579">
                {`Email`}
            </Text>
            <InputField testID="56:575"
                value={email}
                onChangeText={(text) => { clearError(); setEmail(text); }}
                placeholder="Email"
                onSubmitEditing={handleSubmitPress}
                 />
            <Text style={styles.username} testID="56:589">
                {`Username`}
            </Text>
            <InputField testID="56:588"
                value={username}
                onChangeText={(text) => { clearError(); setUsername(text); }}
                placeholder="Username"
                onSubmitEditing={handleSubmitPress}
                 />
            <Text style={styles.password} testID="56:580">
                {`Password`}
            </Text>
            <InputField testID="56:576"
                value={password}
                onChangeText={(text) => { clearError(); setPassword(text); }}
                placeholder="Password"
                onSubmitEditing={handleSubmitPress}
                 />
            <Text style={styles.confirmPassword} testID="56:581">
                {`Confirm Password`}
            </Text>
            <InputField testID="56:577"
                value={confirmPassword}
                onChangeText={(text) => { clearError(); setConfirmPassword(text); }}
                placeholder="Confirm Password"
                secureTextEntry
                onSubmitEditing={handleSubmitPress}
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
    createAccount: {
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
    email: {
        width: 135,
        height: 18,
        color: theme.colors.textPrimary,
        textShadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
        textShadowRadius: 4,
        textShadowOffset: { "width": 0, "height": 4 },
        fontFamily: 'Inter',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '500',
    },
    username: {
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
    }
}))