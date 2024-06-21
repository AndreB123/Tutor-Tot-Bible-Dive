import { View, TextInput, StyleProp, TextStyle } from 'react-native';
import { createStyleSheet } from '../../styles/useStyles';

export interface InputFieldProps {
    onChangeText: (text: string) => void;
    value: string;
    secureTextEntry?: boolean;
    testID?: string;
    placeholder?: string;
    onSubmitEditing: () => void; // Add type for onSubmitEditing
    style?: StyleProp<TextStyle>; // Add style prop
}

export const InputField: React.FC<InputFieldProps> = ({
    onChangeText,
    value,
    onSubmitEditing,
    testID,
    placeholder,
    secureTextEntry = false,
    style, // Destructure style prop
}) => {
    const styles = createStyleSheet(theme => ({
        root: {
            flexDirection: 'column',
            alignItems: 'flex-start',
            shadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
            shadowRadius: 4,
            shadowOffset: { "width": 0, "height": 4 },
            elevation: 4,
        },
        inputField: {
            width: 150,
            height: 34,
            borderWidth: 1,
            color: theme.colors.primaryBackground,
            borderStyle: 'solid',
            paddingTop: 8,
            paddingBottom: 8,
            lineHeight: 18,
            fontSize: 14,
            borderColor: theme.colors.foreground,
            backgroundColor: theme.colors.textSecondary,
            shadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
            shadowRadius: 4,
            shadowOffset: { "width": 0, "height": 4 },
            elevation: 4,
        },
    }));

    return (
        <View style={styles.root} testID={testID}>
            <TextInput
                style={[styles.inputField, style]} // Merge styles
                onSubmitEditing={onSubmitEditing}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                returnKeyType="go"
            />
        </View>
    );
}
