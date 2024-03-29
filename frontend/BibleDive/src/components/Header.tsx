import { Text, View } from "react-native";
import { createStyleSheet } from "../styles/useStyles";



export interface HeaderProps {
    testID?: string,
}
export function Header(props: HeaderProps) {
    const styles = createStyleSheet(theme => ({
        root: {
            width: 360,
            height: 65,
            shadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
            shadowRadius: 4,
            shadowOffset: { "width": 0, "height": 4 },
        },
        rectangle1: {
            width: 360,
            height: 65,
            flexShrink: 0,
            borderBottom: [1, "solid", { "type": "runtime", "name": "var", "arguments": ["--foreground", [{ "type": "color", "value": { "type": "rgb", "r": 0, "g": 0, "b": 0, "alpha": 1 } }]] }],
            backgroundColor: theme.colors.secondaryBackground,
        },
        dashboard: {
            width: 186,
            height: 43,
            flexShrink: 0,
            color: theme.colors.textPrimary,
            textAlign: 'center',
            textShadowColor: 'rgba(0, 0, 0, 0.250980406999588)',
            textShadowRadius: 4,
            textShadowOffset: { "width": 0, "height": 4 },
            fontFamily: 'Inter',
            fontSize: 32,
            fontStyle: 'normal',
            fontWeight: '500',
        },
    }));

    return (
        <View style={styles.root} testID={props.testID}>
            <View style={styles.rectangle1} testID="23:172" />
            <Text style={styles.dashboard} testID="23:173">
                {`Dashboard`}
            </Text>
        </View>
    );
}