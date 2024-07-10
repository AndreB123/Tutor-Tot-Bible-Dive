import React, { useState, useRef, memo, useEffect, forwardRef, useImperativeHandle } from "react";
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
    onPress: (id: string) => void;
    title: string;
    style?: any;
    textStyle?: any;
    data: any[];
    renderItem: ({ item }: { item: any }) => JSX.Element;
    fixedItem?: JSX.Element;
    children: React.ReactNode;
    initialOpen?: boolean;
}

const SideBar = forwardRef(({ onPress, title, style, textStyle, data, renderItem, fixedItem, children, initialOpen = false }: SideBarProps, ref) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const animation = useRef(new Animated.Value(initialOpen ? 1 : 0)).current;

    useEffect(() => {
        setIsOpen(initialOpen);
        animation.setValue(initialOpen ? 1 : 0);
    }, [initialOpen]);

    useImperativeHandle(ref, () => ({
        closeSidebar: () => {
            Animated.timing(animation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setIsOpen(false));
        }
    }));

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
        <View style={{ flexGrow: 1, margin: 0 }}>
            <Animated.View
                style={[
                    styles.background,
                    { transform: [{ translateX: sidebarTranslateX }] },
                    style
                ]}
            >
                <Text style={[styles.header, textStyle]}>{title}</Text>
                {fixedItem && <View>{fixedItem}</View>}
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
});

export default memo(SideBar);

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
        flexGrow: 1,
        top: 0,
        position: 'relative',
    },
    iconButton: {
        position: 'relative',
        top: 10,
        left: 10,
        zIndex: 2,
    },
});
