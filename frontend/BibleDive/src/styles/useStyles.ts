import { StyleSheet } from "react-native";
import { Theme, theme } from "./theme";

export const createStyleSheet = (styleFn: (theme: Theme) => any) => {
    const styles = styleFn(theme);
    return StyleSheet.create(styles);
}