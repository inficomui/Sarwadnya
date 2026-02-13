import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';

interface TopUpModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (amount: number, description: string, receipt: any) => Promise<void>;
    isLoading: boolean;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
    visible,
    onClose,
    onSubmit,
    isLoading
}) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [receipt, setReceipt] = useState<any>(null);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setReceipt({
                uri: uri,
                name: uri.split('/').pop() || 'receipt.jpg',
                type: 'image/jpeg'
            });
        }
    };

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;
        onSubmit(numAmount, description, receipt).then(() => {
            setAmount('');
            setDescription('');
            setReceipt(null);
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <TouchableOpacity
                    style={styles.dismissArea}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={[styles.content, Shadow.large]}>
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <Text style={styles.title}>Request Top-Up</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Top-up Amount (₹)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Min ₹500"
                                placeholderTextColor={colors.text.muted}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Note / Reference (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Add transition details or notes"
                                placeholderTextColor={colors.text.muted}
                                multiline
                                numberOfLines={3}
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Payment Evidence (Screenshot)</Text>
                            <TouchableOpacity
                                style={[styles.uploadArea, receipt && styles.uploadAreaActive]}
                                onPress={handlePickImage}
                            >
                                {receipt ? (
                                    <View style={styles.previewContainer}>
                                        <Image source={{ uri: receipt.uri }} style={styles.previewImage} />
                                        <View style={styles.changeOverlay}>
                                            <Ionicons name="camera" size={20} color="#fff" />
                                            <Text style={styles.changeText}>Change</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <Ionicons name="cloud-upload-outline" size={32} color={colors.primary.start} />
                                        <Text style={styles.uploadText}>Select Payment Screenshot</Text>
                                        <Text style={styles.uploadSubtext}>JPG, PNG up to 5MB</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, (!amount || isLoading) && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={!amount || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitText}>Submit Request</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <Toast />
        </Modal>
    );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
    },
    content: {
        backgroundColor: colors.background.primary,
        borderTopLeftRadius: BorderRadius.xxxl,
        borderTopRightRadius: BorderRadius.xxxl,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        maxHeight: '85%',
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: colors.border,
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    closeBtn: {
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    inputGroup: {
        marginBottom: Spacing.xl,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.background.secondary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: FontSize.md,
        color: colors.text.primary,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    uploadArea: {
        height: 160,
        backgroundColor: colors.background.secondary,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadAreaActive: {
        borderStyle: 'solid',
        borderColor: colors.primary.start,
    },
    uploadPlaceholder: {
        alignItems: 'center',
    },
    uploadText: {
        fontSize: FontSize.md,
        color: colors.text.primary,
        fontWeight: '600',
        marginTop: 12,
    },
    uploadSubtext: {
        fontSize: 10,
        color: colors.text.muted,
        marginTop: 4,
    },
    previewContainer: {
        width: '100%',
        height: '100%',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    changeOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    changeText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: colors.primary.start,
        height: 56,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.lg,
        ...Shadow.medium,
    },
    disabledButton: {
        backgroundColor: colors.border,
    },
    submitText: {
        color: '#fff',
        fontSize: FontSize.lg,
        fontWeight: 'bold',
    },
});
