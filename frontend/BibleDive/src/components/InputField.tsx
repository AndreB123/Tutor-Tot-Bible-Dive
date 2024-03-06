import { View } from 'react-native';
import { createStyleSheet } from '../styles/useStyles';


export interface InputFieldProps {
    testID?: string,
}

export function InputField(props: InputFieldProps) {
    const styles = createStyleSheet(theme => ({
        root: {
            width: 150,
            height: 34,
        },
        inputField: {
            width: 150,
            height: 34,
            flexShrink: 0,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: theme.colors.foreground,
            backgroundColor: theme.colors.textSecondary,
            shadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
            shadowRadius: 4,
            shadowOffset: { "width": 0, "height": 4 },
        },
    }));

    return (
        <View style={styles.root} testID={props.testID}>
            <View style={styles.inputField} testID="1:3768" />
        </View>
    );
}
