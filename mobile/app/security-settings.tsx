
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PatternLock } from '../components/AppLock/PatternLock';
import { PinKeypad } from '../components/AppLock/PinKeypad';
import { BorderRadius, FontSize, Spacing, ThemeColors } from '../constants/Theme';
import { useAppLock } from '../context/AppLockContext';
import { useTheme } from '../context/ThemeContext';

type LockType = 'NONE' | 'PIN' | 'PATTERN';

import * as LocalAuthentication from 'expo-local-authentication';

export default function SecuritySettingsScreen() {
    const router = useRouter();
    const { lockType, setLockSettings, isBiometricsEnabled, toggleBiometrics, checkSupport, biometricType } = useAppLock();
    const { colors, isDark, toggleTheme } = useTheme();

    const styles = useMemo(() => createStyles(colors), [colors]);

    const getBiometricLabel = () => {
        if (biometricType === LocalAuthentication.AuthenticationType.FINGERPRINT) return "Fingerprint Lock";
        if (biometricType === LocalAuthentication.AuthenticationType.IRIS) return "Iris Scan";
        return "Biometric Unlock";
    };

    const [viewMode, setViewMode] = useState<'MAIN' | 'SETUP_PIN' | 'SETUP_PATTERN'>('MAIN');
    const [setupStep, setSetupStep] = useState<'INPUT' | 'CONFIRM'>('INPUT');

    const [tempSecret, setTempSecret] = useState<string>('');
    const [pinInput, setPinInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSelectType = async (type: LockType) => {
        if (type === 'NONE') {
            Alert.alert(
                "Disable App Lock",
                "Are you sure you want to remove app security?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Disable", style: 'destructive', onPress: () => setLockSettings('NONE') }
                ]
            );
            return;
        }

        if (type === 'PIN') {
            setViewMode('SETUP_PIN');
            setSetupStep('INPUT');
            setPinInput('');
            setTempSecret('');
        }

        if (type === 'PATTERN') {
            setViewMode('SETUP_PATTERN');
            setSetupStep('INPUT');
            setTempSecret('');
        }
    };

    const handleBiometricToggle = async () => {
        // Refresh support status in case user just enrolled in Settings
        const supported = await checkSupport();

        if (!supported) {
            Alert.alert("Not Supported", "Biometric authentication is not available or not enrolled on this device.");
            return;
        }

        if (!isBiometricsEnabled) {
            // Enabling
            if (lockType === 'NONE') {
                Alert.alert("Setup Required", "Please set up a PIN or Pattern before enabling biometrics.");
                return;
            }
            await toggleBiometrics(true);
        } else {
            // Disabling
            await toggleBiometrics(false);
        }
    };

    // PIN Logic
    const handlePinPress = (key: string) => {
        if (key === 'backspace') {
            setPinInput(prev => prev.slice(0, -1));
            return;
        }
        if (key === 'biometric') return;

        if (pinInput.length < 6) {
            const newPin = pinInput + key;
            setPinInput(newPin);
            // Auto advance if 4 (or 6?) lets stick to 4 for simplicity or manual confirm?
            // Let's use 4 digits fixed for now
            if (newPin.length === 4) {
                handlePinComplete(newPin);
            }
        }
    };

    const handlePinComplete = (pin: string) => {
        if (setupStep === 'INPUT') {
            setTempSecret(pin);
            setSetupStep('CONFIRM');
            setPinInput('');
            setErrorMsg('');
        } else {
            if (pin === tempSecret) {
                setLockSettings('PIN', pin);
                setViewMode('MAIN');
                Alert.alert("Success", "App PIN set successfully");
            } else {
                setErrorMsg("PINs do not match. Try again.");
                setPinInput('');
                // Optionally reset to INPUT step
                setTimeout(() => {
                    setSetupStep('INPUT');
                    setTempSecret('');
                    setErrorMsg('');
                }, 1000);
            }
        }
    };

    // Pattern Logic
    const handlePatternComplete = (pattern: number[]) => {
        const patternStr = pattern.join('');
        console.log("Pattern Complete:", patternStr, "Step:", setupStep);

        if (setupStep === 'INPUT') {
            setTempSecret(patternStr);
            setSetupStep('CONFIRM');
            setErrorMsg('');
        } else {
            console.log("Confirming Pattern:", patternStr, "Expected:", tempSecret);
            if (patternStr === tempSecret) {
                console.log("Pattern Match! Saving settings...");
                setLockSettings('PATTERN', patternStr);
                setViewMode('MAIN');
                Alert.alert("Success", "Pattern lock set successfully");
            } else {
                console.log("Pattern Mismatch");
                setErrorMsg("Patterns do not match. Try again.");
                setTimeout(() => {
                    setSetupStep('INPUT');
                    setTempSecret('');
                    setErrorMsg('');
                }, 1000);
            }
        }
    };

    const getLockTypeLabel = () => {
        if (lockType === 'NONE') return 'None';
        if (lockType === 'PIN') return 'PIN Code';
        if (lockType === 'PATTERN') return 'Pattern';
        return 'Unknown';
    };

    const renderMainView = () => (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Current Security</Text>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>App Lock Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: lockType !== 'NONE' ? colors.status.info + '20' : colors.status.error + '20' }]}>
                        <Text style={[styles.statusText, { color: lockType !== 'NONE' ? colors.status.info : colors.status.error }]}>
                            {lockType !== 'NONE' ? 'ENABLED' : 'DISABLED'}
                        </Text>
                    </View>
                </View>
                {lockType !== 'NONE' && (
                    <View style={styles.currentTypeContainer}>
                        <View style={styles.statusRow}>
                            <Text style={styles.currentTypeLabel}>Method</Text>
                            <Text style={[styles.statusText, { color: colors.text.primary }]}>{getLockTypeLabel()}</Text>
                        </View>
                        <View style={styles.statusRow}>
                            <Text style={styles.currentTypeLabel}>Biometrics</Text>
                            <Text style={[styles.statusText, { color: isBiometricsEnabled ? colors.status.success : colors.text.muted }]}>
                                {isBiometricsEnabled ? 'ON' : 'OFF'}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            <Text style={styles.sectionHeader}>Appearance</Text>
            <SecurityOption
                title="Dark Mode"
                subtitle={isDark ? "Dark mode is active" : "Light mode is active"}
                icon={isDark ? "moon" : "sunny"}
                selected={isDark}
                onPress={toggleTheme}
            />

            <Text style={styles.sectionHeader}>Lock Method</Text>

            <SecurityOption
                title="None"
                subtitle="Disable app lock"
                icon="lock-open-outline"
                selected={lockType === 'NONE'}
                onPress={() => handleSelectType('NONE')}
            />
            <SecurityOption
                title="PIN Code"
                subtitle="Use a 4-digit PIN"
                icon="keypad-outline"
                selected={lockType === 'PIN'}
                onPress={() => handleSelectType('PIN')}
            />
            <SecurityOption
                title="Pattern"
                subtitle="Draw a pattern to unlock"
                icon="grid-outline"
                selected={lockType === 'PATTERN'}
                onPress={() => handleSelectType('PATTERN')}
            />

            <Text style={styles.sectionHeader}>More Options</Text>
            <SecurityOption
                title={getBiometricLabel()}
                subtitle="Use device security to unlock"
                onPress={handleBiometricToggle}
            />


        </ScrollView>
    );

    // Helper to get biometric title
    const getBiometricTitle = () => {
        // We can check the type from context or generic
        return "Biometric Unlock";
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => viewMode === 'MAIN' ? router.back() : setViewMode('MAIN')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {viewMode === 'MAIN' ? 'Security Settings' :
                        viewMode === 'SETUP_PIN' ? 'Set PIN' : 'Set Pattern'}
                </Text>
                <View style={{ width: 44 }} />
            </View>

            {viewMode === 'MAIN' && renderMainView()}

            {viewMode === 'SETUP_PIN' && (
                <View style={styles.setupContainer}>
                    <View style={styles.bgGlow} />

                    {/* Header Part */}
                    <View style={{ alignItems: 'center' }}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="keypad-outline" size={32} color={colors.primary.start} />
                        </View>
                        <Text style={styles.instructionText}>
                            {setupStep === 'INPUT' ? 'Enter New PIN' : 'Confirm PIN'}
                        </Text>
                        <Text style={styles.instructionSubText}>
                            {setupStep === 'INPUT' ? 'Create a secure 4-digit code' : 'Re-enter to verify'}
                        </Text>
                    </View>

                    {/* Input Part */}
                    <View style={styles.setupContent}>
                        <View style={styles.pinDisplay}>
                            {[...Array(4)].map((_, i) => (
                                <View key={i} style={[styles.pinDot, pinInput.length > i && styles.pinDotFilled, errorMsg ? styles.pinDotError : null]} />
                            ))}
                        </View>
                        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                        <View style={{ marginTop: 50, width: '100%' }}>
                            <PinKeypad
                                onPress={handlePinPress}
                                onDelete={() => handlePinPress('backspace')}
                                textColor={colors.text.primary}
                                borderColor={colors.border}
                            />
                        </View>
                    </View>

                    {/* Spacer for bottom balance */}
                    <View style={{ height: 40 }} />
                </View>
            )}

            {viewMode === 'SETUP_PATTERN' && (
                <View style={styles.setupContainer}>
                    <View style={styles.bgGlow} />

                    {/* Header Part */}
                    <View style={{ alignItems: 'center' }}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="grid-outline" size={32} color={colors.primary.start} />
                        </View>
                        <Text style={styles.instructionText}>
                            {setupStep === 'INPUT' ? 'Draw New Pattern' : 'Confirm Pattern'}
                        </Text>
                        <Text style={styles.instructionSubText}>
                            {setupStep === 'INPUT' ? 'Connect at least 3 dots' : 'Re-draw to verify'}
                        </Text>
                    </View>

                    {/* Input Part */}
                    <View style={styles.setupContent}>
                        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
                        <View style={{ marginTop: 20 }}>
                            <PatternLock
                                key={`${viewMode}-${setupStep}`}
                                onPatternComplete={handlePatternComplete}
                                error={!!errorMsg}
                                dotColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}
                                activeDotColor={colors.primary.start}
                                lineColor={colors.primary.start}
                            />
                        </View>
                    </View>

                    {/* Spacer for bottom balance */}
                    <View style={{ height: 40 }} />
                </View>
            )}

        </SafeAreaView>
    );
}

const SecurityOption = ({ title, subtitle, icon, selected, onPress }: any) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <TouchableOpacity style={[styles.optionCard, selected && styles.optionSelected]} onPress={onPress}>
            <View style={styles.optionIconContainer}>
                <Ionicons name={icon} size={24} color={selected ? colors.status.info : colors.text.secondary} />
            </View>
            <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{title}</Text>
                <Text style={styles.optionSubtitle}>{subtitle}</Text>
            </View>
            {selected && <Ionicons name="checkmark-circle" size={24} color={colors.status.info} />}
        </TouchableOpacity>
    );
};

const { width } = Dimensions.get('window');

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    bgGlow: {
        position: 'absolute',
        top: -100,
        alignSelf: 'center',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width,
        backgroundColor: colors.iconBg.blue,
        pointerEvents: 'none',
        opacity: 0.3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
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
    card: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        marginBottom: Spacing.md,
        color: colors.text.primary,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: FontSize.md,
        color: colors.text.secondary,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
    },
    currentTypeContainer: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    currentTypeLabel: {
        fontSize: FontSize.md,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    sectionHeader: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.muted,
        marginBottom: Spacing.md,
        marginLeft: Spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    optionSelected: {
        borderColor: colors.status.info,
        backgroundColor: colors.iconBg.blue,
    },
    optionIconContainer: {
        marginRight: Spacing.md,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: FontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
    },
    optionTitleSelected: {
        color: colors.status.info,
    },
    optionSubtitle: {
        fontSize: FontSize.sm,
        color: colors.text.secondary,
    },
    setupContainer: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.xl,
        justifyContent: 'space-between',
        paddingVertical: 60,
    },
    setupContent: {
        width: '100%',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.background.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    instructionText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    instructionSubText: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 40,
        textAlign: 'center',
    },
    pinDisplay: {
        flexDirection: 'row',
        marginBottom: 20,
        height: 20,
    },
    pinDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: colors.text.muted,
        marginHorizontal: 15,
    },
    pinDotFilled: {
        backgroundColor: colors.status.info,
        borderColor: colors.status.info,
        transform: [{ scale: 1.2 }],
    },
    pinDotError: {
        borderColor: colors.status.error,
        backgroundColor: colors.status.error,
    },
    errorText: {
        color: colors.status.error,
        fontSize: FontSize.md,
        marginTop: 10,
        fontWeight: 'bold',
    }
});
