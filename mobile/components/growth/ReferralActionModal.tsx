import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
import { useActivateReferralMutation, useGetWalletQuery, useRefundReferralMutation } from '../../redux/apies/walletApi';

interface ReferralActionModalProps {
    visible: boolean;
    onClose: () => void;
    referral: {
        id: number;
        name: string;
    } | null;
    onSuccess?: () => void;
}

export const ReferralActionModal: React.FC<ReferralActionModalProps> = ({
    visible,
    onClose,
    referral,
    onSuccess
}) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const [activeTab, setActiveTab] = useState<'activate' | 'refund'>('activate');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const { data: walletData, isLoading: isWalletLoading, refetch: refetchWallet } = useGetWalletQuery(undefined, {
        skip: !visible
    });

    const [activateReferral, { isLoading: isActivating }] = useActivateReferralMutation();
    const [refundReferral, { isLoading: isRefunding }] = useRefundReferralMutation();

    const isLoading = isActivating || isRefunding;
    const walletBalance = Number(walletData?.data?.wallet_balance || 0);

    useEffect(() => {
        if (visible) {
            setAmount('');
            setDescription('');
            setActiveTab('activate');
        }
    }, [visible]);

    const handleSubmit = async () => {
        if (!referral) return;

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            Toast.show({ type: 'error', text1: 'Invalid Amount', text2: 'Please enter a valid amount' });
            return;
        }

        if (activeTab === 'activate' && amountNum > walletBalance) {
            Toast.show({ type: 'error', text1: 'Insufficient Balance', text2: 'Your wallet balance is too low' });
            return;
        }

        if (activeTab === 'refund' && !description.trim()) {
            Toast.show({ type: 'error', text1: 'Required', text2: 'Please enter a reason for refund' });
            return;
        }

        try {
            if (activeTab === 'activate') {
                await activateReferral({
                    referral_id: referral.id,
                    amount: amountNum,
                    total_months: 12
                }).unwrap();
                Toast.show({ type: 'success', text1: 'Success!', text2: `Account activated for ${referral.name}` });
            } else {
                await refundReferral({
                    referral_id: referral.id,
                    amount: amountNum,
                    description: description.trim()
                } as any).unwrap();
                Toast.show({ type: 'success', text1: 'Refund Sent!', text2: 'Refund request processed successfully' });
            }

            refetchWallet();
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            const msg = error?.data?.message || `Failed to process ${activeTab}`;
            Toast.show({ type: 'error', text1: 'Error', text2: msg });
        }
    };

    if (!referral) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={[
                                styles.headerIcon,
                                { backgroundColor: activeTab === 'activate' ? colors.primary.start + '15' : colors.status.error + '15' }
                            ]}>
                                <Ionicons
                                    name={activeTab === 'activate' ? "flash" : "wallet"}
                                    size={24}
                                    color={activeTab === 'activate' ? colors.primary.start : colors.status.error}
                                />
                            </View>
                            <View style={styles.headerText}>
                                <Text style={styles.title}>
                                    {activeTab === 'activate' ? 'Activate Member' : 'Get Refund'}
                                </Text>
                                <Text style={styles.subtitle} numberOfLines={1}>
                                    For {referral.name}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.text.muted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                            {/* Wallet Balance Card */}
                            {activeTab === 'activate' && (
                                <LinearGradient
                                    colors={[colors.primary.start, colors.primary.end]}
                                    style={styles.balanceCard}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.balanceLabel}>Your Wallet Balance</Text>
                                    <Text style={styles.balanceValue}>
                                        {isWalletLoading ? '...' : `₹${walletBalance.toLocaleString('en-IN')}`}
                                    </Text>
                                    <Ionicons name="wallet-outline" size={48} color="rgba(255,255,255,0.15)" style={styles.cardBgIcon} />
                                </LinearGradient>
                            )}

                            {/* Tabs */}
                            <View style={styles.tabsContainer}>
                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 'activate' && styles.tabActive]}
                                    onPress={() => setActiveTab('activate')}
                                >
                                    <Ionicons name="add-circle-outline" size={18} color={activeTab === 'activate' ? '#fff' : colors.text.secondary} />
                                    <Text style={[styles.tabText, activeTab === 'activate' && styles.tabTextActive]}>Activate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 'refund' && styles.tabActiveRefund]}
                                    onPress={() => setActiveTab('refund')}
                                >
                                    <Ionicons name="remove-circle-outline" size={18} color={activeTab === 'refund' ? '#fff' : colors.text.secondary} />
                                    <Text style={[styles.tabText, activeTab === 'refund' && styles.tabTextActive]}>Refund</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Info Box */}
                            <View style={[
                                styles.infoBox,
                                { backgroundColor: activeTab === 'activate' ? (isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb') : (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2') }
                            ]}>
                                <Ionicons
                                    name="information-circle"
                                    size={20}
                                    color={activeTab === 'activate' ? (isDark ? '#f59e0b' : '#b45309') : colors.status.error}
                                />
                                <Text style={[
                                    styles.infoText,
                                    { color: activeTab === 'activate' ? (isDark ? '#f59e0b' : '#b45309') : colors.status.error }
                                ]}>
                                    {activeTab === 'activate'
                                        ? `Funds will be deducted from your wallet to activate ${referral.name}'s plan.`
                                        : `This will request/process a refund from ${referral.name}'s wallet back to yours.`}
                                </Text>
                            </View>

                            {/* Form */}
                            <View style={styles.form}>
                                <Text style={styles.label}>Amount (₹)</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.currencyPrefix}>₹</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="1000"
                                        keyboardType="numeric"
                                        value={amount}
                                        onChangeText={setAmount}
                                        placeholderTextColor={colors.text.muted}
                                    />
                                </View>

                                {activeTab === 'refund' && (
                                    <>
                                        <Text style={styles.label}>Reason for Refund</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="Explain why you are requesting a refund..."
                                            multiline
                                            numberOfLines={3}
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholderTextColor={colors.text.muted}
                                        />
                                    </>
                                )}
                            </View>
                        </ScrollView>

                        {/* Footer Button */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.submitButton, (isLoading || isWalletLoading) && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={isLoading || isWalletLoading}
                            >
                                <LinearGradient
                                    colors={activeTab === 'activate' ? [colors.primary.start, colors.primary.end] : [colors.status.error, '#dc2626']}
                                    style={styles.submitGradient}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Text style={styles.submitText}>
                                                {activeTab === 'activate' ? 'Confirm Activation' : 'Process Refund'}
                                            </Text>
                                            <Ionicons
                                                name={activeTab === 'activate' ? "checkmark-circle" : "arrow-back-circle"}
                                                size={20}
                                                color="#fff"
                                            />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
            <Toast />
        </Modal>
    );
};

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
    },
    modalContainer: {
        backgroundColor: colors.background.primary,
        borderTopLeftRadius: BorderRadius.xxxl,
        borderTopRightRadius: BorderRadius.xxxl,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    subtitle: {
        fontSize: FontSize.xs,
        color: colors.text.muted,
        marginTop: 2,
    },
    closeButton: {
        padding: Spacing.sm,
    },
    scrollContent: {
        padding: Spacing.xl,
    },
    balanceCard: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.xl,
        overflow: 'hidden',
    },
    balanceLabel: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    balanceValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 4,
    },
    cardBgIcon: {
        position: 'absolute',
        right: -10,
        bottom: -10,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background.secondary,
        borderRadius: BorderRadius.lg,
        padding: 4,
        marginBottom: Spacing.xl,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: BorderRadius.md,
        gap: 6,
    },
    tabActive: {
        backgroundColor: colors.primary.start,
        ...Shadow.small,
    },
    tabActiveRefund: {
        backgroundColor: colors.status.error,
        ...Shadow.small,
    },
    tabText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    tabTextActive: {
        color: '#fff',
    },
    infoBox: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: 10,
        marginBottom: Spacing.xl,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '500',
    },
    form: {
        gap: Spacing.md,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: Spacing.md,
    },
    currencyPrefix: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.muted,
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: FontSize.lg,
        color: colors.text.primary,
        fontWeight: '600',
    },
    textArea: {
        height: 100,
        backgroundColor: colors.background.secondary,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: Spacing.md,
        textAlignVertical: 'top',
        fontSize: FontSize.sm,
    },
    footer: {
        padding: Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    submitButton: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        ...Shadow.medium,
    },
    submitGradient: {
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    submitText: {
        color: '#fff',
        fontSize: FontSize.md,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.6,
    }
});
