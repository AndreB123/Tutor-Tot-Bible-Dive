import { Pressable, Text } from "react-native";
import { createStyleSheet } from "../styles/useStyles";

export interface SubmitButtonProps {
    onPress: () => void;
    testID?: string,
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ onPress, testID }) => {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [
            styles.root,
            pressed && styles.pressed
        ]} testID={testID}>
            <Text style={styles.submit}>
                Submit
            </Text>
        </Pressable>
    );
};

const styles = createStyleSheet(theme => ({
    root: {
        flexDirection: 'row',
        paddingTop: 8,
        paddingLeft: 52,
        paddingRight: 52,
        paddingBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 11,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: theme.colors.foreground,
        backgroundColor: 'rgba(49, 69, 209, 1)',
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowRadius: 4,
        shadowOffset: { "width": 0, "height": 4 },
        elevation: 4,
    },
    submit: {
        color: theme.colors.textPrimary,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowRadius: 4,
        textShadowOffset: { "width": 0, "height": 4 },
        fontFamily: 'Inter',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '500',
    },
    pressed: {
        opacity: 0.5,
    },
}));