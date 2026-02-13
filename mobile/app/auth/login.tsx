import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import Logo from '../../components/common/Logo';
import { BorderRadius, Shadow, ThemeColors } from '../../constants/Theme';
import { useAppLock } from '../../context/AppLockContext';
import { useTheme } from '../../context/ThemeContext';
import { useLoginUserMutation } from '../../redux/apies/authApi';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loginUser, { isLoading }] = useLoginUserMutation();
    const { user } = useAuth();
    const { lockType, hasSkippedSetup } = useAppLock();

    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    React.useEffect(() => {
        if (user) {
            if (lockType === 'NONE' && !hasSkippedSetup) {
                router.replace('/auth/setup-security');
            } else {
                router.replace('/(tabs)');
            }
        }
    }, [user, lockType, hasSkippedSetup]);

    const handleLogin = async () => {
        if (!email || !password) {
            Toast.show({
                type: 'error',
                text1: 'Required Fields',
                text2: 'Please enter both email/phone and password',
            });
            return;
        }

        try {
            await loginUser({ email, password }).unwrap();
            Toast.show({
                type: 'success',
                text1: 'Welcome!',
                text2: 'Logged in successfully',
            });
        } catch (error: any) {
            console.error('Login error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient
                colors={[colors.primary.start, colors.primary.end]}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <View style={styles.logoContainer}>
                        <Logo size="medium" variant="full" animated={true} />
                    </View>
                    <Text style={styles.subtitleText}>Your trusted partner for success</Text>
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.formScroll}
                contentContainerStyle={styles.formContent}
            >
                <View style={styles.loginCard}>
                    <Text style={styles.formTitle}>Sign In</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email or Phone</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email or phone"
                                placeholderTextColor={colors.text.muted}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter password"
                                placeholderTextColor={colors.text.muted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={colors.text.muted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => router.push('/auth/forgot-password')}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={[colors.primary.start, colors.primary.end]}
                            style={styles.loginGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>CONTINUE</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href="/auth/register" asChild>
                            <TouchableOpacity>
                                <Text style={styles.signupText}>Create One</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>

                <View style={styles.bottomInfo}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.text.muted} />
                    <Text style={styles.secureText}>Secure SSL Encrypted Connection</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    headerGradient: {
        height: height * 0.4,
        paddingTop: 60,
        alignItems: 'center',
    },
    headerContent: {
        alignItems: 'center',
        gap: 12,
    },
    logoContainer: {
        backgroundColor: colors.background.card,
        padding: 10,
        borderRadius: 20,
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    subtitleText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    formScroll: {
        flex: 1,
        marginTop: -60,
    },
    formContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    loginCard: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xxxl,
        padding: 30,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.large,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 24,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.secondary,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.background.secondary,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 56,
        color: colors.text.primary,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        color: colors.primary.start,
        fontWeight: 'bold',
        fontSize: 14,
    },
    loginButton: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginBottom: 24,
        ...Shadow.medium,
    },
    loginGradient: {
        height: 56,
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
        alignItems: 'center',
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
    bottomInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 24,
    },
    secureText: {
        fontSize: 12,
        color: colors.text.muted,
        fontWeight: '500',
    },
});
