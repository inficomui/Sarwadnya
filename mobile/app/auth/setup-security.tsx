import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PatternLock } from '../../components/AppLock/PatternLock';
import { PinKeypad } from '../../components/AppLock/PinKeypad';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useAppLock } from '../../context/AppLockContext';
import { useTheme } from '../../context/ThemeContext';

export default function SetupSecurityScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
    const { setLockSettings, skipLockSetup } = useAppLock();

    const [viewMode, setViewMode] = useState<'CHOICE' | 'PIN' | 'PATTERN'>('CHOICE');
    const [setupStep, setSetupStep] = useState<'INPUT' | 'CONFIRM'>('INPUT');
    const [tempSecret, setTempSecret] = useState<string>('');
    const [pinInput, setPinInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSkip = async () => {
        Alert.alert(
            "Skip Security Setup?",
            "You can always set this up later in Settings > Security.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Skip for Now",
                    onPress: async () => {
                        await skipLockSetup();
                        router.replace('/(tabs)');
                    }
                }
            ]
        );
    };

    const handlePinPress = (key: string) => {
        if (key === 'backspace') {
            setPinInput(prev => prev.slice(0, -1));
            return;
        }
        if (key === 'biometric') return;

        if (pinInput.length < 4) {
            const newPin = pinInput + key;
            setPinInput(newPin);
            if (newPin.length === 4) {
                handlePinComplete(newPin);
            }
        }
    };

    const handlePinComplete = async (pin: string) => {
        if (setupStep === 'INPUT') {
            setTempSecret(pin);
            setSetupStep('CONFIRM');
            setPinInput('');
            setErrorMsg('');
        } else {
            if (pin === tempSecret) {
                await setLockSettings('PIN', pin);
                Alert.alert("Success", "App PIN set successfully", [
                    { text: "Continue", onPress: () => router.replace('/(tabs)') }
                ]);
            } else {
                setErrorMsg("PINs do not match. Try again.");
                setPinInput('');
                setTimeout(() => {
                    setSetupStep('INPUT');
                    setTempSecret('');
                    setErrorMsg('');
                }, 1000);
            }
        }
    };

    const handlePatternComplete = async (pattern: number[]) => {
        const patternStr = pattern.join('');

        if (setupStep === 'INPUT') {
            setTempSecret(patternStr);
            setSetupStep('CONFIRM');
            setErrorMsg('');
        } else {
            if (patternStr === tempSecret) {
                await setLockSettings('PATTERN', patternStr);
                Alert.alert("Success", "Pattern lock set successfully", [
                    { text: "Continue", onPress: () => router.replace('/(tabs)') }
                ]);
            } else {
                setErrorMsg("Patterns do not match. Try again.");
                setTimeout(() => {
                    setSetupStep('INPUT');
                    setTempSecret('');
                    setErrorMsg('');
                }, 1000);
            }
        }
    };

    const renderChoiceView = () => (
        <View style={styles.choiceContainer}>
            <View style={styles.header}>
                <Ionicons name="shield-checkmark-outline" size={60} color={colors.primary.start} />
                <Text style={styles.title}>Secure Your App</Text>
                <Text style={styles.subtitle}>
                    Add an extra layer of security to protect your investments and personal data.
                </Text>
            </View>

            <View style={styles.optionsContainer}>
                <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => {
                        setViewMode('PIN');
                        setSetupStep('INPUT');
                        setPinInput('');
                        setErrorMsg('');
                    }}
                >
                    <Ionicons name="keypad-outline" size={24} color={colors.text.primary} />
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Set PIN Code</Text>
                        <Text style={styles.optionSubtitle}>Create a 4-digit PIN</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.text.muted} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => {
                        setViewMode('PATTERN');
                        setSetupStep('INPUT');
                        setTempSecret('');
                        setErrorMsg('');
                    }}
                >
                    <Ionicons name="grid-outline" size={24} color={colors.text.primary} />
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Set Pattern Lock</Text>
                        <Text style={styles.optionSubtitle}>Draw a pattern to unlock</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.text.muted} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            {viewMode === 'CHOICE' ? (
                renderChoiceView()
            ) : (
                <View style={styles.setupContainer}>
                    <View style={styles.setupHeader}>
                        <TouchableOpacity
                            onPress={() => setViewMode('CHOICE')}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                        <Text style={styles.setupTitle}>
                            {viewMode === 'PIN' ? 'Set PIN' : 'Set Pattern'}
                        </Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <Text style={styles.instructionText}>
                        {setupStep === 'INPUT'
                            ? (viewMode === 'PIN' ? 'Enter new 4-digit PIN' : 'Draw new pattern')
                            : (viewMode === 'PIN' ? 'Confirm your PIN' : 'Confirm pattern')
                        }
                    </Text>

                    {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                    {viewMode === 'PIN' && (
                        <>
                            <View style={styles.pinDisplay}>
                                {[...Array(4)].map((_, i) => (
                                    <View key={i} style={[styles.pinDot, pinInput.length > i && styles.pinDotFilled]} />
                                ))}
                            </View>
                            <View style={{ marginTop: 'auto', width: '100%', marginBottom: 20 }}>
                                <PinKeypad
                                    onPress={handlePinPress}
                                    onDelete={() => handlePinPress('backspace')}
                                    textColor={colors.text.primary}
                                    borderColor={colors.border}
                                />
                            </View>
                        </>
                    )}

                    {viewMode === 'PATTERN' && (
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <PatternLock
                                key={`${viewMode}-${setupStep}`}
                                onPatternComplete={handlePatternComplete}
                                error={!!errorMsg}
                                dotColor={colors.text.muted}
                                activeDotColor={colors.primary.start}
                                lineColor={colors.primary.start}
                            />
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    choiceContainer: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
    },
    optionsContainer: {
        gap: Spacing.md,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.small,
    },
    optionTextContainer: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    optionTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    optionSubtitle: {
        fontSize: FontSize.sm,
        color: colors.text.muted,
    },
    skipButton: {
        marginTop: 40,
        padding: Spacing.md,
        alignItems: 'center',
    },
    skipText: {
        fontSize: FontSize.md,
        color: colors.text.secondary,
        fontWeight: '600',
    },
    setupContainer: {
        flex: 1,
        backgroundColor: colors.background.primary,
        padding: Spacing.lg,
    },
    setupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    backButton: {
        padding: 8,
    },
    setupTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    instructionText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: 15,
    },
    errorText: {
        color: colors.status.error,
        fontSize: FontSize.md,
        textAlign: 'center',
        marginBottom: 15,
        fontWeight: 'bold',
    },
    pinDisplay: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 25,
    },
    pinDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.text.primary,
        marginHorizontal: 10,
    },
    pinDotFilled: {
        backgroundColor: colors.text.primary,
    },
});
