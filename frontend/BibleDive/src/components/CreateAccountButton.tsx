import React from "react";
import { createStyleSheet } from "../styles/useStyles";
import { Pressable, Text } from 'react-native';


export interface CreateAccountButtonProps {
    onPress: () => void,
    testID?: string,
}

export const CreateAccountButton: React.FC<CreateAccountButtonProps> = ({ onPress, testID }) => {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [
            styles.root,
            pressed && styles.pressed
        ]} testID={testID}>
            <Text style={styles.lorumIpsum}>
                Create Account
            </Text>
        </Pressable>
    );
}

const styles = createStyleSheet(theme => ({
    root: {
        flexDirection: 'row',
        paddingTop: 8,
        paddingLeft: 26,
        paddingRight: 26,
        paddingBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 11,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: theme.colors.foreground,
        backgroundColor: 'rgba(49, 69, 209, 1)',
        shadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
        shadowRadius: 4,
        shadowOffset: { "width": 0, "height": 4 },
        elevation: 4,
    },
    lorumIpsum: {
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
    pressed: {
        opacity: 0.5,
    },
}));

