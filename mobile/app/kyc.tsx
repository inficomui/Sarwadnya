import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { BorderRadius, FontSize, Gradients, Shadow, Spacing, ThemeColors } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';
import { useCheckUserKycStatusQuery, useGetUserKycFieldsQuery, useSubmitUserKycMutation } from '../redux/apies/kycApi';

export default function KycScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { data: fields, isLoading: loadingFields } = useGetUserKycFieldsQuery();
    const { data: kycStatus, refetch: refetchStatus } = useCheckUserKycStatusQuery();
    const [submitKyc, { isLoading: isSubmitting }] = useSubmitUserKycMutation();

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [files, setFiles] = useState<Record<string, any>>({});

    const styles = useMemo(() => createStyles(colors), [colors]);

    const handlePickImage = async (fieldKey: string) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setFiles({
                ...files,
                [fieldKey]: {
                    uri,
                    name: uri.split('/').pop() || `${fieldKey}.jpg`,
                    type: 'image/jpeg'
                }
            });
        }
    };

    const handleSubmit = async () => {
        const submission = new FormData();

        let allValid = true;
        fields?.forEach(field => {
            if (field.type === 'file') {
                if (field.is_required && !files[field.name]) allValid = false;
                if (files[field.name]) {
                    submission.append(field.name, files[field.name]);
                }
            } else {
                if (field.is_required && !formData[field.name]) allValid = false;
                submission.append(field.name, formData[field.name] || '');
            }
        });

        if (!allValid) {
            Toast.show({ type: 'error', text1: 'Required Fields', text2: 'Please fill all required fields' });
            return;
        }

        try {
            await submitKyc(submission).unwrap();
            Toast.show({ type: 'success', text1: 'Success', text2: 'KYC submitted successfully!' });
            refetchStatus();
            router.back();
        } catch (error) {
            console.error(error);
        }
    };

    if (loadingFields) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary.start} />
            </View>
        );
    }

    if (kycStatus?.status === 'pending') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>KYC Status</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.statusContent}>
                    <View style={styles.statusIconWrapper}>
                        <Ionicons name="time" size={64} color={colors.status.warning} />
                    </View>
                    <Text style={styles.statusTitle}>Under Review</Text>
                    <Text style={styles.statusDesc}>
                        Your KYC documents have been submitted and are currently being reviewed by our team. This usually takes 24-48 hours.
                    </Text>
                    <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                        <Text style={styles.closeButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>KYC Verification</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.introText}>
                    Please provide the following details to verify your identity and unlock all features.
                </Text>

                {fields?.map((field) => (
                    <View key={field.id} style={styles.fieldGroup}>
                        <Text style={styles.label}>
                            {field.label} {field.is_required && <Text style={{ color: colors.status.error }}>*</Text>}
                        </Text>

                        {field.type === 'file' ? (
                            <TouchableOpacity
                                style={[styles.uploadBox, files[field.name] && styles.uploadBoxActive]}
                                onPress={() => handlePickImage(field.name)}
                            >
                                {files[field.name] ? (
                                    <View style={styles.previewContainer}>
                                        <Image source={{ uri: files[field.name].uri }} style={styles.previewImage} />
                                        <View style={styles.changeOverlay}>
                                            <Ionicons name="camera" size={20} color="#fff" />
                                            <Text style={styles.changeText}>Change</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <Ionicons name="cloud-upload-outline" size={32} color={colors.primary.start} />
                                        <Text style={styles.uploadText}>Upload {field.label}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <TextInput
                                style={styles.input}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                placeholderTextColor={colors.text.muted}
                                value={formData[field.name]}
                                onChangeText={(val) => setFormData({ ...formData, [field.name]: val })}
                            />
                        )}
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <LinearGradient
                        colors={Gradients.primary as [string, string, ...string[]]}
                        style={styles.submitGradient}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitText}>Submit for Verification</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: 40,
    },
    introText: {
        fontSize: FontSize.sm,
        color: colors.text.secondary,
        marginBottom: Spacing.xl,
        lineHeight: 20,
    },
    fieldGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.background.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        fontSize: FontSize.md,
        color: colors.text.primary,
    },
    uploadBox: {
        height: 140,
        backgroundColor: colors.background.card,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    uploadBoxActive: {
        borderStyle: 'solid',
        borderColor: colors.primary.start,
    },
    uploadPlaceholder: {
        alignItems: 'center',
    },
    uploadText: {
        fontSize: FontSize.sm,
        color: colors.primary.start,
        fontWeight: '600',
        marginTop: 8,
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
        fontSize: 12,
    },
    submitButton: {
        marginTop: Spacing.xl,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadow.medium,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitGradient: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: FontSize.md,
        fontWeight: 'bold',
    },
    statusContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    statusIconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.status.warning + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    statusTitle: {
        fontSize: FontSize.xxl,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 12,
    },
    statusDesc: {
        fontSize: FontSize.md,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    closeButton: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    closeButtonText: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
});
