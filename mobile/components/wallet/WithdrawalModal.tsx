import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import { BorderRadius, FontSize, Gradients, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { useGetBankDetailsQuery } from '../../redux/apies/paymentApi';
import { useGetWalletQuery } from '../../redux/apies/walletApi';
import { useRequestWithdrawalMutation } from '../../redux/apies/withdrawalApi';

interface WithdrawalModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function WithdrawalModal({ visible, onClose, onSuccess }: WithdrawalModalProps) {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const { data: walletData, isLoading: isWalletLoading } = useGetWalletQuery();
    const { data: bankData, isLoading: isBankLoading } = useGetBankDetailsQuery();
    const [requestWithdrawal, { isLoading: isSubmitting }] = useRequestWithdrawalMutation();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const walletBalance = parseFloat(walletData?.data?.wallet_balance || '0');
    const banks = bankData?.data || [];
    const selectedBank = banks.find((b: any) => b.is_primary) || banks[0];

    const handleSubmit = async () => {
        const amountNum = parseFloat(amount);

        if (isNaN(amountNum) || amountNum <= 0) {
            Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please enter a valid amount' });
            return;
        }

        if (amountNum > walletBalance) {
            Toast.show({ type: 'error', text1: 'Insufficient Balance', text2: 'Your wallet balance is too low' });
            return;
        }

        if (!selectedBank) {
            Toast.show({
                type: 'error',
                text1: 'No Bank Account',
                text2: 'Please add a bank account first'
            });
            return;
        }

        try {
            const result = await requestWithdrawal({
                amount: amountNum,
                bank_account_id: selectedBank.id,
                description: description.trim() || undefined
            }).unwrap();

            Toast.show({
                type: 'success',
                text1: 'Request Submitted',
                text2: result.message || 'Your withdrawal request is pending approval.'
            });

            setAmount('');
            setDescription('');
            onClose();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            const errorMsg = error?.data?.message || 'Failed to submit withdrawal request';
            Toast.show({ type: 'error', text1: 'Error', text2: errorMsg });
        }
    };

    const handleAddBank = () => {
        onClose();
        router.push('/bank-details');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderContent}>
                            <View style={styles.modalIcon}>
                                <Ionicons name="download" size={24} color="#fff" />
                            </View>
                            <View style={styles.modalHeaderText}>
                                <Text style={styles.modalTitle}>Withdraw Funds</Text>
                                <Text style={styles.modalSubtitle}>Request withdrawal to your bank account</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {/* Wallet Balance */}
                        <LinearGradient
                            colors={Gradients.primary as [string, string, ...string[]]}
                            style={styles.balanceCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.balanceContent}>
                                <View style={styles.balanceHeader}>
                                    <Ionicons name="wallet" size={16} color="rgba(255,255,255,0.8)" />
                                    <Text style={styles.balanceLabel}>Available Balance</Text>
                                </View>
                                <Text style={styles.balanceValue}>
                                    {isWalletLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        `₹${walletBalance.toLocaleString('en-IN')}`
                                    )}
                                </Text>
                            </View>
                        </LinearGradient>

                        {/* Selected Bank Info */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Withdraw To</Text>
                            {isBankLoading ? (
                                <ActivityIndicator color={colors.primary.start} style={{ alignSelf: 'flex-start' }} />
                            ) : selectedBank ? (
                                <View style={styles.bankCard}>
                                    <View style={styles.bankIcon}>
                                        <Ionicons name="business" size={20} color={colors.primary.start} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.bankName}>{selectedBank.bank_name}</Text>
                                        <Text style={styles.bankAccount}>•••• {selectedBank.account_number.slice(-4)}</Text>
                                    </View>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.addBankButton} onPress={handleAddBank}>
                                    <Ionicons name="add-circle-outline" size={20} color={colors.primary.start} />
                                    <Text style={styles.addBankText}>Add Bank Account</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Amount Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Withdrawal Amount (₹)</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.currencySymbol}>₹</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter amount"
                                    placeholderTextColor={colors.text.muted}
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                    editable={!isSubmitting}
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.maxButton}
                                onPress={() => setAmount(walletBalance.toString())}
                            >
                                <Text style={styles.maxButtonText}>Max: ₹{walletBalance.toLocaleString('en-IN')}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Description Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Description (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="e.g. Monthly withdrawal, Emergency funds..."
                                placeholderTextColor={colors.text.muted}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                value={description}
                                onChangeText={setDescription}
                                editable={!isSubmitting}
                            />
                        </View>

                        {/* Info Banner */}
                        <View style={styles.infoBanner}>
                            <Ionicons name="information-circle" size={20} color="#f59e0b" />
                            <Text style={styles.infoBannerText}>
                                Funds will be transferred to your selected bank account within 24-48 hours.
                            </Text>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, (isSubmitting || !selectedBank) && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isSubmitting || isWalletLoading || !selectedBank}
                        >
                            <LinearGradient
                                colors={['#ef4444', '#dc2626'] as [string, string, ...string[]]}
                                style={styles.submitGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <ActivityIndicator color="#fff" />
                                        <Text style={styles.submitText}>Processing...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.submitText}>Request Withdrawal</Text>
                                        <Ionicons name="download" size={20} color="#fff" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <Toast />
        </Modal>
    );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: colors.background.primary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        ...Shadow.large,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modalIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#ef444420',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    modalHeaderText: {
        flex: 1,
    },
    modalTitle: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    modalSubtitle: {
        fontSize: FontSize.sm,
        color: colors.text.muted,
        marginTop: 2,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.background.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBody: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
    },
    balanceCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
        ...Shadow.medium,
    },
    balanceContent: {},
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    balanceLabel: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    balanceValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    infoBanner: {
        flexDirection: 'row',
        backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fbbf2420',
    },
    infoBannerText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: colors.text.secondary,
        lineHeight: 20,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    inputLabel: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: Spacing.md,
    },
    currencySymbol: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: colors.text.muted,
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: Spacing.md,
        fontSize: FontSize.lg,
        color: colors.text.primary,
    },
    textArea: {
        backgroundColor: colors.background.secondary,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        minHeight: 80,
    },
    maxButton: {
        marginTop: Spacing.sm,
        alignSelf: 'flex-end',
    },
    maxButtonText: {
        fontSize: FontSize.xs,
        color: colors.primary.start,
        fontWeight: '600',
    },
    submitButton: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginTop: Spacing.md,
        marginBottom: Spacing.xl,
        ...Shadow.medium,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        gap: Spacing.sm,
    },
    submitText: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: '#fff',
    },
    bankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.primary.start,
        gap: Spacing.md,
    },
    bankIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bankName: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    bankAccount: {
        fontSize: FontSize.sm,
        color: colors.text.secondary,
    },
    addBankButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.secondary,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.primary.start,
        borderStyle: 'dashed',
        gap: 8,
    },
    addBankText: {
        color: colors.primary.start,
        fontWeight: '600',
        fontSize: FontSize.md,
    },
});
