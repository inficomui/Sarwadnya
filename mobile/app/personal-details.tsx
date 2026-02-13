import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '../redux/apies/authApi';

export default function PersonalDetailsScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { data: profileData, isLoading, refetch } = useGetUserProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

    const [isEditMode, setIsEditMode] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const styles = useMemo(() => createStyles(colors), [colors]);

    useEffect(() => {
        if (profileData) {
            setName(profileData.name || '');
            setEmail(profileData.email || '');
            setPhoneNumber(profileData.phone_number || '');
        }
    }, [profileData]);

    const handleSave = async () => {
        if (!name || !email || !phoneNumber) {
            Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all fields' });
            return;
        }

        try {
            await updateProfile({
                name,
                email,
                phone_number: phoneNumber
            }).unwrap();

            Toast.show({ type: 'success', text1: 'Success', text2: 'Profile updated successfully' });
            setIsEditMode(false);
            refetch();
        } catch (error: any) {
            console.error(error);
            const errorMsg = error?.data?.message || 'Failed to update profile';
            Toast.show({ type: 'error', text1: 'Error', text2: errorMsg });
        }
    };

    const handleCancel = () => {
        if (profileData) {
            setName(profileData.name || '');
            setEmail(profileData.email || '');
            setPhoneNumber(profileData.phone_number || '');
        }
        setIsEditMode(false);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.start} />
                    <Text style={styles.loadingText}>Loading profile...</Text>
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
                <Text style={styles.headerTitle}>Personal Information</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Summary Card */}
                <LinearGradient
                    colors={Gradients.primary as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.summaryCard}
                >
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {profileData?.name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.summaryName}>{profileData?.name}</Text>
                    <View style={styles.verifiedBadge}>
                        <Ionicons name="shield-checkmark" size={14} color="#fff" />
                        <Text style={styles.verifiedText}>Verified Account</Text>
                    </View>
                </LinearGradient>

                {/* Details Form */}
                <View style={styles.formContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Account Details</Text>
                        {!isEditMode && (
                            <TouchableOpacity onPress={() => setIsEditMode(true)} style={styles.editButton}>
                                <Ionicons name="create-outline" size={18} color={colors.primary.start} />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Name Field */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldHeader}>
                            <Ionicons name="person-outline" size={20} color={colors.primary.start} />
                            <Text style={styles.fieldLabel}>Full Name</Text>
                        </View>
                        {isEditMode ? (
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                                placeholderTextColor={colors.text.muted}
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{profileData?.name || 'Not set'}</Text>
                        )}
                    </View>

                    {/* Email Field */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldHeader}>
                            <Ionicons name="mail-outline" size={20} color={colors.primary.start} />
                            <Text style={styles.fieldLabel}>Email Address</Text>
                        </View>
                        {isEditMode ? (
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor={colors.text.muted}
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{profileData?.email || 'Not set'}</Text>
                        )}
                    </View>

                    {/* Phone Field */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldHeader}>
                            <Ionicons name="call-outline" size={20} color={colors.primary.start} />
                            <Text style={styles.fieldLabel}>Phone Number</Text>
                        </View>
                        {isEditMode ? (
                            <TextInput
                                style={styles.input}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Enter your phone number"
                                keyboardType="phone-pad"
                                placeholderTextColor={colors.text.muted}
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{profileData?.phone_number || 'Not set'}</Text>
                        )}
                    </View>

                    {/* Referral Code (Read-only) */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldHeader}>
                            <Ionicons name="gift-outline" size={20} color={colors.primary.start} />
                            <Text style={styles.fieldLabel}>Referral Code</Text>
                        </View>
                        <View style={styles.referralCodeContainer}>
                            <Text style={styles.referralCode}>{profileData?.referral_code || 'N/A'}</Text>
                            <TouchableOpacity style={styles.copyButton}>
                                <Ionicons name="copy-outline" size={16} color={colors.primary.start} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    {isEditMode && (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleCancel}
                                disabled={isUpdating}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleSave}
                                disabled={isUpdating}
                            >
                                <LinearGradient
                                    colors={Gradients.primary as [string, string, ...string[]]}
                                    style={styles.saveGradient}
                                >
                                    {isUpdating ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                            <Text style={styles.saveButtonText}>Save Changes</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        color: colors.text.muted,
        fontSize: FontSize.md,
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
    summaryCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xxl,
        alignItems: 'center',
        marginBottom: Spacing.xl,
        ...Shadow.medium,
    },
    avatarContainer: {
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    summaryName: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: Spacing.sm,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    verifiedText: {
        color: '#fff',
        fontSize: FontSize.xs,
        fontWeight: '600',
    },
    formContainer: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    editButtonText: {
        color: colors.primary.start,
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    fieldContainer: {
        marginBottom: Spacing.lg,
    },
    fieldHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.sm,
    },
    fieldLabel: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    fieldValue: {
        fontSize: FontSize.md,
        color: colors.text.primary,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        backgroundColor: colors.background.secondary,
        borderRadius: BorderRadius.md,
    },
    input: {
        backgroundColor: colors.background.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: colors.text.primary,
    },
    referralCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background.secondary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    referralCode: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: colors.primary.start,
        letterSpacing: 1,
    },
    copyButton: {
        padding: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    button: {
        flex: 1,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    cancelButton: {
        backgroundColor: colors.background.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    cancelButtonText: {
        color: colors.text.secondary,
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    saveButton: {
        ...Shadow.medium,
    },
    saveGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        gap: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: FontSize.md,
        fontWeight: 'bold',
    },
});
