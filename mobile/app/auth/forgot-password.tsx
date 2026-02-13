import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
import { BorderRadius, Shadow, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import {
    useResetPasswordMutation,
    useSendPasswordResetOTPMutation,
    useVerifyPasswordResetOTPMutation
} from '../../redux/apies/authApi';

const { height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
    const [step, setStep] = useState(0);

    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [sendOtp, { isLoading: isSending }] = useSendPasswordResetOTPMutation();
    const [verifyOtp, { isLoading: isVerifying }] = useVerifyPasswordResetOTPMutation();
    const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

    const handleSendOtp = async () => {
        if (!identifier) {
            Toast.show({ type: 'error', text1: 'Required', text2: 'Please enter your email or username' });
            return;
        }
        try {
            await sendOtp({ identifier }).unwrap();
            Toast.show({ type: 'success', text1: 'OTP Sent', text2: 'Check your email for the code' });
            setStep(1);
        } catch (error) { }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            Toast.show({ type: 'error', text1: 'Required', text2: 'Please enter the OTP' });
            return;
        }
        try {
            await verifyOtp({ identifier, otp }).unwrap();
            Toast.show({ type: 'success', text1: 'Verified', text2: 'OTP Verified successfully' });
            setStep(2);
        } catch (error) { }
    };

    const handleResetPassword = async () => {
        if (!password || !passwordConfirmation) {
            Toast.show({ type: 'error', text1: 'Required', text2: 'Please fill all fields' });
            return;
        }
        if (password !== passwordConfirmation) {
            Toast.show({ type: 'error', text1: 'Mismatch', text2: 'Passwords do not match' });
            return;
        }

        try {
            await resetPassword({ identifier, otp, password, password_confirmation: passwordConfirmation }).unwrap();
            Toast.show({ type: 'success', text1: 'Success', text2: 'Password has been reset' });
            router.replace('/auth/login');
        } catch (error) { }
    };

    const renderStep0 = () => (
        <View style={styles.card}>
            <Text style={styles.stepTitle}>Forgot Password?</Text>
            <Text style={styles.stepDesc}>Enter your email or username to receive a reset code.</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email / Username</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.text.muted}
                        value={identifier}
                        onChangeText={setIdentifier}
                        autoCapitalize="none"
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={handleSendOtp} disabled={isSending}>
                <LinearGradient
                    colors={[colors.secondary.start, colors.secondary.end]}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    {isSending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SEND OTP</Text>}
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.card}>
            <Text style={styles.stepTitle}>Verify OTP</Text>
            <Text style={styles.stepDesc}>Enter the 6-digit code sent to {identifier}</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>One Time Password</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="key-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                    <TextInput
                        style={styles.otpInput}
                        placeholder="XXXXXX"
                        placeholderTextColor={colors.text.muted}
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={handleVerifyOtp} disabled={isVerifying}>
                <LinearGradient
                    colors={[colors.secondary.start, colors.secondary.end]}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    {isVerifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>VERIFY CODE</Text>}
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep(0)} style={{ alignSelf: 'center', marginTop: 15 }}>
                <Text style={{ color: colors.primary.start }}>Resend Code / Change Email</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.card}>
            <Text style={styles.stepTitle}>New Password</Text>
            <Text style={styles.stepDesc}>Create a strong password for your account.</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="New password"
                        placeholderTextColor={colors.text.muted}
                        value={password}
                        onChangeText={setPassword}
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
                        value={passwordConfirmation}
                        onChangeText={setPasswordConfirmation}
                        secureTextEntry={true}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={handleResetPassword} disabled={isResetting}>
                <LinearGradient
                    colors={[colors.secondary.start, colors.secondary.end]}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    {isResetting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>RESET PASSWORD</Text>}
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

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
                    <Text style={styles.welcomeText}>Reset Password</Text>
                    <Text style={styles.subtitleText}>Get back into your account</Text>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.formContainer}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {step === 0 && renderStep0()}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
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
        height: height * 0.25,
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
    },
    card: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xxl,
        padding: 24,
        ...Shadow.medium,
        borderWidth: 1,
        borderColor: colors.border,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 8,
    },
    stepDesc: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
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
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 48,
        color: colors.text.primary,
        fontSize: 14,
    },
    otpInput: {
        flex: 1,
        height: 48,
        color: colors.text.primary,
        letterSpacing: 5,
        fontSize: 18,
    },
    eyeIcon: {
        padding: 10,
    },
    actionButton: {
        borderRadius: 12,
        overflow: 'hidden',
        ...Shadow.medium,
        marginTop: 10,
    },
    gradientButton: {
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
