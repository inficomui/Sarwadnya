import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, BorderRadius, FontSize, Gradients, Shadow } from '../../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface ImagePreviewModalProps {
    visible: boolean;
    imageUrl: string;
    title: string;
    onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
    visible,
    imageUrl,
    title,
    onClose
}) => {
    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.backdrop}
                    onPress={onClose}
                />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.imageWrapper}>
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={onClose}
                        >
                            <LinearGradient
                                colors={Gradients.primary as [string, string, ...string[]]}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>Close Preview</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        width: width * 0.9,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: BorderRadius.xxl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        ...Shadow.large,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    title: {
        flex: 1,
        color: '#fff',
        fontSize: FontSize.md,
        fontWeight: 'bold',
        marginRight: Spacing.md,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        width: '100%',
        height: height * 0.5,
        backgroundColor: '#fff',
        padding: Spacing.sm,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    footer: {
        padding: Spacing.lg,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
    },
    actionButton: {
        width: '100%',
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: FontSize.md,
    }
});
