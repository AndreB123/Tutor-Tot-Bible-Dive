import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStyleSheet } from '../../styles/useStyles';

interface ConfirmationOverlayProps {
    visible: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationOverlay: React.FC<ConfirmationOverlayProps> = ({ visible, message, onConfirm, onCancel }) => {
    const styles = createStyleSheet((theme) => ({
        overlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        container: {
            width: '80%',
            padding: 20,
            backgroundColor: theme.colors.primaryBackground,
            borderRadius: 10,
            alignItems: 'center',
        },
        message: {
            color: theme.colors.textPrimary,
            fontSize: 16,
            marginBottom: 20,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
        },
        button: {
            flex: 1,
            marginHorizontal: 10,
            paddingVertical: 10,
            borderRadius: 5,
            alignItems: 'center',
        },
        confirmButton: {
            backgroundColor: theme.colors.focus,
        },
        cancelButton: {
            backgroundColor: theme.colors.errors,
        },
        buttonText: {
            color: theme.colors.textPrimary,
            fontSize: 16,
        },
    }));

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmationOverlay;
