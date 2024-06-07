import React, { useState, useRef } from "react";
import {
    Animated,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

interface SideBarProps {
    onPress: () => void;
    title: string;
    style?: any;
    textStyle?: any;
    data: any[];
    renderItem: ({ item }: { item: any }) => JSX.Element;
    children: React.ReactNode;
}

const SideBar: React.FC<SideBarProps> = ({ onPress, title, style, textStyle, data, renderItem, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const toggleSidebar = () => {
        const toValue = isOpen ? 0 : 1;
        Animated.timing(animation, {
            toValue,
            duration: 300,
            useNativeDriver: true,
        }).start();
        setIsOpen(!isOpen);
    };

    const sidebarTranslateX = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-width * 0.8, 0],
    });

    const contentTranslateX = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, width * 0.8],
    });

    return (
        <View style={{ flex: 1 }}>
            <Animated.View
                style={[
                    styles.background,
                    { transform: [{ translateX: sidebarTranslateX }] },
                    style
                ]}
            >
                <Text style={[styles.header, textStyle]}>{title}</Text>
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                />
            </Animated.View>

            <Animated.View style={[styles.content, { transform: [{ translateX: contentTranslateX }] }]}>
                <TouchableOpacity onPress={toggleSidebar} style={styles.iconButton}>
                    <Icon name="menu" size={30} color="white" />
                </TouchableOpacity>
                {children}
            </Animated.View>
        </View>
    );
};

export default SideBar;

const styles = StyleSheet.create({
    background: {
        backgroundColor: 'black',
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: width * 0.8,
        height: height,
        zIndex: 1,
    },
    header: {
        fontSize: 24,
        color: 'white',
        padding: 10,
    },
    content: {
        flex: 1,
        position: 'relative',
    },
    iconButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 2,
    },
});
