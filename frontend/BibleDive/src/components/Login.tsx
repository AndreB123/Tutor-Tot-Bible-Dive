import { View, Text } from "react-native";
import { createStyleSheet } from "../styles/useStyles";
import { SubmitButton } from "./SubmitButton";
import { InputField } from "./InputField";
import { Button } from "./Button";

export interface LoginProps {
    testID?: string,
}

export function Login(props: LoginProps) {
    const styles = createStyleSheet(theme => ({
        root: {
            width: 220,
            height: 317,
        },
        rectangle3: {
            width: 220,
            height: 317,
            flexShrink: 0,
            borderRadius: 12,
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: theme.colors.foreground,
            backgroundColor: theme.colors.inputFields,
            shadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
            shadowRadius: 4,
            shadowOffset: { "width": 0, "height": 4 },
        },
        or: {
            width: 147,
            height: 17,
            flexShrink: 0,
            color: theme.colors.background,
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: '500',
        },
        password: {
            width: 147,
            height: 27,
            flexShrink: 0,
            color: theme.colors.background,
            fontFamily: 'Inter',
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: '500',
        },
        username: {
            width: 147,
            height: 27,
            flexShrink: 0,
            color: theme.colors.background,
            fontFamily: 'Inter',
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: '500',
        },
    }));

    return (
        <View style = { styles.root } testID = { props.testID } >
            <View style={ styles.rectangle3 } testID = "1:3766" />
            <Button testID="53:482" />
            <Text style={ styles.or } testID = "53:394" >
                {`Or`}
            </Text>
            <InputField testID = "1:3787" />
            <Text style={ styles.password } testID = "1:3772" >
                {`Password`}
            </Text>
            <InputField testID = "1:3789" />
            <SubmitButton testID="1:3790" />
            <Text style={ styles.username } testID = "1:3771" >
                {`Username`}
            </Text>
        </View>
    );
}
