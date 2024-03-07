import { View, Text } from "react-native";
import { createStyleSheet } from "../styles/useStyles";
import { SubmitButton } from "./SubmitButton";
import { InputField } from "./InputField";
import { CreateAccountButton } from "./CreateAccountButton";
import React, { useState } from "react";
import { login } from "../services/AuthService";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigationtypes";

export interface LoginProps {
    testID?: string,
}

type DashboardNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Dashboard'
>;

export function Login(props: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation<DashboardNavigationProp>();

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
        }
    }));

    const handleLoginPress = async () => {
        const isSuccess = await login(username, password);
        if (isSuccess) {
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

    return (
        <View style={styles.root} testID={props.testID} >
            <Text style={styles.username} testID="1:3771" >
                {`Username`}
            </Text>
            <InputField testID="1:3787"
                onChangeText={setUsername}
                placeholder="Username" />
            <Text style={styles.password} testID="1:3772" >
                {`Password`}
            </Text>
            <InputField testID="1:3789"
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry />
            {error ? <Text style={styles.errors}>{error}</Text> : null}
            <SubmitButton onPress={handleLoginPress} testID="1:3790" />
            <Text style={styles.or} testID="53:394" >
                {`Or`}
            </Text>
            <CreateAccountButton onPress={handleCreateAccountPress} testID="53:482" />
        </View>
    );
}
