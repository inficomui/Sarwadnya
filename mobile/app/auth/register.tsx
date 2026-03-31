import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { BorderRadius, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { useLazyGetReferralByCodeQuery, useRegisterUsersMutation } from '../../redux/apies/authApi';

const { height } = Dimensions.get('window');

export default function RegisterScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        referral_code: (params.ref as string) || '',
    });

    const [referralName, setReferralName] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [registerUser, { isLoading: isRegistering }] = useRegisterUsersMutation();
    const [triggerReferralSearch, { isFetching: isSearchingReferral }] = useLazyGetReferralByCodeQuery();

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleVerifyReferral = async () => {
        if (!formData.referral_code || formData.referral_code.length < 3) return;

        try {
            const result = await triggerReferralSearch(formData.referral_code).unwrap();
            if (result) {
                setReferralName(result.name);
                Toast.show({
                    type: 'success',
                    text1: 'Referral Verified',
                    text2: `Sponsored by ${result.name}`,
                });
            }
        } catch (error) {
            setReferralName(null);
            Toast.show({
                type: 'error',
                text1: 'Invalid Referral',
                text2: 'Could not find a user with this referral code',
            });
        }
    };

    const handleRegister = async () => {
        if (!formData.name || !formData.email || !formData.phone_number || !formData.password || !formData.password_confirmation) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill all required fields',
            });
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            Toast.show({
                type: 'error',
                text1: 'Password Mismatch',
                text2: 'Passwords do not match',
            });
            return;
        }

        try {
            const result = await registerUser(formData).unwrap();
            if (result) {
                Toast.show({
                    type: 'success',
                    text1: 'Registration Successful',
                    text2: 'Welcome to Shree Sarwadnya!',
                });
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            
            let errorMessage = 'Registration failed';
            
            if (error?.data?.errors) {
                // Combine all validation errors into one message
                const allErrors = Object.values(error.data.errors).flat();
                if (allErrors.length > 0) {
                    errorMessage = allErrors.join(' ');
                }
            } else if (error?.data?.message) {
                errorMessage = error.data.message;
            }

            Toast.show({
                type: 'error',
                text1: 'Registration Failed',
                text2: errorMessage,
            });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={[colors.primary.start, colors.primary.end]}
                style={styles.gradientHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.circle1} />
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.welcomeText}>Create Account</Text>
                    <Text style={styles.subtitleText}>Join our growing community</Text>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.formContainer}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    overScrollMode="never"
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.card}>
                        <View style={styles.inputRow}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Full Name</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="person-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full name"
                                        placeholderTextColor={colors.text.muted}
                                        value={formData.name}
                                        onChangeText={(val) => handleChange('name', val)}
                                    />
                                </View>
                            </View>

                            <View style={{ width: Spacing.md }} />

                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Email</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="mail-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor={colors.text.muted}
                                        value={formData.email}
                                        onChangeText={(val) => handleChange('email', val)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="call-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter mobile number"
                                    placeholderTextColor={colors.text.muted}
                                    value={formData.phone_number}
                                    onChangeText={(val) => handleChange('phone_number', val)}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Referral Code (Optional)</Text>
                            <View style={styles.referralWrapper}>
                                <View style={[styles.inputWrapper, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }]}>
                                    <Ionicons name="people-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Referral code"
                                        placeholderTextColor={colors.text.muted}
                                        value={formData.referral_code}
                                        onChangeText={(val) => handleChange('referral_code', val)}
                                        autoCapitalize="characters"
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.verifyButton}
                                    onPress={handleVerifyReferral}
                                    disabled={isSearchingReferral || !formData.referral_code}
                                >
                                    {isSearchingReferral ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.verifyText}>Verify</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            {referralName && (
                                <Text style={styles.referralSuccess}>
                                    <Ionicons name="checkmark-circle" size={14} /> Sponsored by: {referralName}
                                </Text>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Create password"
                                    placeholderTextColor={colors.text.muted}
                                    value={formData.password}
                                    onChangeText={(val) => handleChange('password', val)}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text.muted} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm password"
                                    placeholderTextColor={colors.text.muted}
                                    value={formData.password_confirmation}
                                    onChangeText={(val) => handleChange('password_confirmation', val)}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text.muted} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleRegister}
                            disabled={isRegistering}
                        >
                            <LinearGradient
                                colors={[colors.secondary.start, colors.secondary.end]}
                                style={styles.loginGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isRegistering ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.loginButtonText}>CREATE ACCOUNT</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Link href="/auth/login" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.signupText}>Login</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    gradientHeader: {
        height: height * 0.30,
        paddingTop: 50,
        paddingHorizontal: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    circle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -50,
        right: -50,
    },
    backButton: {
        marginBottom: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerContent: {
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    subtitleText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    formContainer: {
        flex: 1,
        marginTop: -30,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xxl,
        padding: 24,
        ...Shadow.medium,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
    },
    referralWrapper: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    verifyButton: {
        backgroundColor: colors.primary.start,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    verifyText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    referralSuccess: {
        fontSize: 12,
        color: colors.status.success,
        marginTop: 4,
        marginLeft: 4,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 48,
        color: colors.text.primary,
        fontSize: 14,
    },
    eyeIcon: {
        padding: 10,
    },
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
        ...Shadow.medium,
        marginBottom: 20,
        marginTop: 10,
    },
    loginGradient: {
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        color: colors.text.secondary,
        fontSize: 14,
    },
    signupText: {
        color: colors.primary.start,
        fontWeight: 'bold',
        fontSize: 14,
    },
});
