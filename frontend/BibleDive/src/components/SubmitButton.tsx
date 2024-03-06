import { View, Text } from "react-native";
import { createStyleSheet } from "../styles/useStyles";

export interface SubmitButtonProps {
    testID?: string,
}

export function SubmitButton(props: SubmitButtonProps) {
    const styles = createStyleSheet(theme => ({
        root: {
            width: 150,
            height: 34,
        },
        rectangle6: {
            width: 150,
            height: 34,
            flexShrink: 0,
            borderRadius: 11,
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: theme.colors.foreground,
            backgroundColor: 'rgba(49, 69, 209, 1)',
            shadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
            shadowRadius: 4,
            shadowOffset: { "width": 0, "height": 4 },
        },
        submit: {
            width: 150,
            height: 34,
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            color: theme.colors.textPrimary,
            textAlign: 'center',
            textShadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
            textShadowRadius: 4,
            textShadowOffset: { "width": 0, "height": 4 },
            fontFamily: 'Inter',
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: '500',
        },
    }));
    return (
        <View style={styles.root} testID={props.testID}>
            <View style={styles.rectangle6} testID="1:3769" />
            <Text style={styles.submit} testID="1:3773">
                {`Submit`}
            </Text>
        </View>
    );


}