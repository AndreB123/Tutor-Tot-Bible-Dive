import { View, Text } from "react-native";
import { createStyleSheet } from "../styles/useStyles";
import { SubmitButton } from "./SubmitButton";
import { InputField } from "./templates/InputField";
import { CreateAccountButton } from "./CreateAccountButton";
import React, { useState } from "react";
import { login } from "../services/AuthService";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigationtypes";
import { useAuth } from "../context/AuthContext";

export interface LoginProps {
    testID?: string,
}

type DashboardNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Dashboard'
>;

export const Login: React.FC<LoginProps> = ({ testID }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation<DashboardNavigationProp>();
    const { checkAuthState } = useAuth();

    const handleLoginPress = async () => {
        const isSuccess = await login(username.toLowerCase(), password);
        if (isSuccess) {
            await checkAuthState();
            navigation.navigate('Dashboard');
        } else {
            setUsername('');
            setPassword('');
            setError('Login information is incorrect.');
        }
    };

    const handleCreateAccountPress = () => {
        navigation.navigate('CreateAccount');
    };

    const clearError = () => setError('');

    return (
        <View style={styles.root} testID={testID} >
            <Text style={styles.username} testID="1:3771" >
                {`Username`}
            </Text>
            <InputField
                value={username}
                onChangeText={(text) => { clearError(); setUsername(text); }}
                placeholder="Username"
                onSubmitEditing={handleLoginPress} 
                style={styles.inputField}
                />
            <Text style={styles.password} testID="1:3772" >
                {`Password`}
            </Text>
            <InputField
                value={password}
                onChangeText={(text) => { clearError(); setPassword(text); }}
                placeholder="Password"
                secureTextEntry
                onSubmitEditing={handleLoginPress}
                style={styles.inputField} 
                />
            {error ? <Text style={styles.errors}>{error}</Text> : null}
            <SubmitButton onPress={handleLoginPress} testID="1:3790" />
            <Text style={styles.or} testID="53:394" >
                {`Or`}
            </Text>
            <CreateAccountButton onPress={handleCreateAccountPress} testID="53:482" />
        </View>
    );
}

const styles = createStyleSheet(theme => ({
    root: {
        paddingTop: 27,
        paddingLeft: 32,
        paddingRight: 32,
        paddingBottom: 27,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: 9,
        columnGap: 9,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: theme.colors.foreground,
        backgroundColor: theme.colors.inputFields,
        shadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
        shadowRadius: 4,
        shadowOffset: { "width": 0, "height": 4 },
    },
    username: {
        width: 147,
        height: 27,
        color: theme.colors.background,
        fontFamily: 'Inter',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '500',
    },
    password: {
        width: 147,
        height: 27,
        color: theme.colors.background,
        fontFamily: 'Inter',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '500',
    },
    or: {
        width: 147,
        height: 17,
        color: theme.colors.background,
        textAlign: 'center',
        fontFamily: 'Inter',
        fontSize: 14,
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