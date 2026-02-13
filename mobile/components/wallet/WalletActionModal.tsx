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
import { useGetMyInvestmentsQuery } from '../../redux/apies/investmentApi';
import { useActivateReferralMutation, useGetWalletQuery, useRefundReferralMutation } from '../../redux/apies/walletApi';

interface WalletActionModalProps {
    visible: boolean;
    onClose: () => void;
    referral: {
        id: number;
        name: string;
        email?: string;
    } | null;
    onSuccess?: () => void;
}

export default function WalletActionModal({ visible, onClose, referral, onSuccess }: WalletActionModalProps) {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const { data: walletData, isLoading: isWalletLoading, isFetching, refetch } = useGetWalletQuery();
    const [activeTab, setActiveTab] = useState<'activate' | 'refund'>('activate');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedInvestmentId, setSelectedInvestmentId] = useState<number | null>(null);

    const [activateReferral, { isLoading: isActivating }] = useActivateReferralMutation();
    const [refundReferral, { isLoading: isRefunding }] = useRefundReferralMutation();

    // Fetch investments for refund selection
    const { data: investmentsData, isLoading: isInvestmentsLoading } = useGetMyInvestmentsQuery(undefined, {
        skip: activeTab !== 'refund' || !referral,
        refetchOnMountOrArgChange: true
    });

    const isLoading = isActivating || isRefunding;
    const walletBalance = useMemo(() => {
        const bal = walletData?.data?.wallet_balance;
        if (!bal) return 0;
        return parseFloat(bal.toString().replace(/[^0-9.-]/g, '')) || 0;
    }, [walletData]);

    // Filter investments for this user
    const investmentsList = Array.isArray(investmentsData?.data)
        ? investmentsData.data
        : (investmentsData?.data?.data || []);

    const refundableInvestments = investmentsList.filter((inv: any) =>
        inv.status === 'active'
    );

    useEffect(() => {
        if (visible) {
            refetch();
            setAmount('');
            setDescription('');
            setSelectedInvestmentId(null);
            setActiveTab('activate');
        }
    }, [visible, referral, refetch]);

    const handleSubmit = async () => {
        if (!referral) return;

        if (activeTab === 'activate') {
            const amountNum = parseFloat(amount);
            if (isNaN(amountNum) || amountNum <= 0) {
                Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please enter a valid amount' });
                return;
            }

            if (amountNum > walletBalance) {
                Toast.show({ type: 'error', text1: 'Insufficient Balance', text2: `Insufficient balance. Available: ₹${walletBalance.toLocaleString('en-IN')}` });
                return;
            }

            try {
                const result = await activateReferral({
                    referral_id: referral.id,
                    amount: amountNum,
                    total_months: 12
                }).unwrap();
                Toast.show({ type: 'success', text1: 'Success', text2: result.message || 'Activation successful' });
                if (onSuccess) onSuccess();
                onClose();
            } catch (error: any) {
                const errorMsg = error?.data?.message || 'Failed to activate plan';
                Toast.show({ type: 'error', text1: 'Error', text2: errorMsg });
            }
        } else {
            // Processing Refund
            if (!selectedInvestmentId) {
                Toast.show({ type: 'error', text1: 'Selection Missing', text2: 'Please select an investment to refund' });
                return;
            }

            try {
                const result = await refundReferral({
                    investment_id: selectedInvestmentId
                }).unwrap();
                Toast.show({ type: 'success', text1: 'Success', text2: result.message || 'Refund processed successfully' });
                if (onSuccess) onSuccess();
                onClose();
            } catch (error: any) {
                const errorMsg = error?.data?.message || 'Failed to process refund';
                Toast.show({ type: 'error', text1: 'Error', text2: errorMsg });
            }
        }
    };

    if (!referral) return null;

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
                            <View style={[styles.modalIcon, activeTab === 'activate' ? styles.activateIcon : styles.refundIcon]}>
                                <Ionicons
                                    name={activeTab === 'activate' ? 'flash' : 'wallet'}
                                    size={24}
                                    color="#fff"
                                />
                            </View>
                            <View style={styles.modalHeaderText}>
                                <Text style={styles.modalTitle}>
                                    {activeTab === 'activate' ? 'Activate Member' : 'Process Refund'}
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    Account for <Text style={styles.modalSubtitleBold}>{referral.name}</Text>
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {/* Wallet Balance (for Activate tab) */}
                        {activeTab === 'activate' && (
                            <LinearGradient
                                colors={[colors.primary.start, colors.primary.end]}
                                style={styles.balanceCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.balanceContent}>
                                    <View style={styles.balanceHeader}>
                                        <Ionicons name="wallet" size={16} color="rgba(255,255,255,0.8)" />
                                        <Text style={styles.balanceLabel}>Your Available Balance</Text>
                                    </View>
                                    <Text style={styles.balanceValue}>
                                        {(isWalletLoading || isFetching) ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            walletData?.data?.wallet_balance ? (
                                                walletData.data.wallet_balance.toString().includes('₹')
                                                    ? walletData.data.wallet_balance
                                                    : `₹${walletData.data.wallet_balance}`
                                            ) : '₹0.00'
                                        )}
                                    </Text>
                                </View>
                            </LinearGradient>
                        )}

                        {/* Tab Selector */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'activate' && styles.activeTabTextContainer]}
                                onPress={() => setActiveTab('activate')}
                            >
                                <Ionicons name="add-circle" size={18} color={activeTab === 'activate' ? '#fff' : colors.text.muted} />
                                <Text style={[styles.tabText, activeTab === 'activate' && styles.activeTabText]}>
                                    Invest / Activate
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'refund' && styles.activeTabRefundTextContainer]}
                                onPress={() => setActiveTab('refund')}
                            >
                                <Ionicons name="remove-circle" size={18} color={activeTab === 'refund' ? '#fff' : colors.text.muted} />
                                <Text style={[styles.tabText, activeTab === 'refund' && styles.activeTabTextRefund]}>
                                    Get Refund
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Info Banner */}
                        <View style={[styles.infoBanner, activeTab === 'refund' && styles.infoBannerRefund]}>
                            <Ionicons
                                name="information-circle"
                                size={20}
                                color={activeTab === 'activate' ? '#f59e0b' : '#ef4444'}
                            />
                            <Text style={styles.infoBannerText}>
                                {activeTab === 'activate'
                                    ? `Funds will be deducted from your wallet and invested for ${referral.name}.`
                                    : `Cancel an investment made for ${referral.name} and get a refund to your wallet.`}
                            </Text>
                        </View>

                        {/* Active Tab Content */}
                        {activeTab === 'activate' ? (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Amount (₹)</Text>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.currencySymbol}>₹</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter amount"
                                        placeholderTextColor={colors.text.muted}
                                        keyboardType="numeric"
                                        value={amount}
                                        onChangeText={setAmount}
                                        editable={!isLoading}
                                    />
                                </View>
                            </View>
                        ) : (
                            <View style={styles.refundContainer}>
                                {isInvestmentsLoading ? (
                                    <View style={styles.loadingState}>
                                        <ActivityIndicator color={colors.primary.start} />
                                        <Text style={styles.loadingText}>Loading investments...</Text>
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={styles.inputLabel}>Select Active Investment to Refund</Text>
                                        {refundableInvestments.length > 0 ? (
                                            refundableInvestments.map((inv: any) => (
                                                <TouchableOpacity
                                                    key={inv.id}
                                                    style={[
                                                        styles.investmentItem,
                                                        selectedInvestmentId === inv.id && styles.selectedInvestment
                                                    ]}
                                                    onPress={() => setSelectedInvestmentId(inv.id)}
                                                >
                                                    <View>
                                                        <Text style={styles.invAmount}>₹{Number(inv.amount).toLocaleString('en-IN')}</Text>
                                                        <Text style={styles.invDate}>{new Date(inv.created_at).toLocaleDateString()}</Text>
                                                    </View>
                                                    {selectedInvestmentId === inv.id ? (
                                                        <Ionicons name="checkmark-circle" size={24} color={colors.primary.start} />
                                                    ) : (
                                                        <View style={styles.radioCircle} />
                                                    )}
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <View style={styles.emptyState}>
                                                <Ionicons name="alert-circle-outline" size={32} color={colors.text.muted} />
                                                <Text style={styles.emptyText}>No active investments found found for this user that you can refund.</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (isLoading || (activeTab === 'refund' && !selectedInvestmentId)) && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={isLoading || isWalletLoading || (activeTab === 'refund' && !selectedInvestmentId)}
                        >
                            <LinearGradient
                                colors={activeTab === 'activate'
                                    ? [colors.primary.start, colors.primary.end]
                                    : ['#ef4444', '#dc2626']}
                                style={styles.submitGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isLoading ? (
                                    <>
                                        <ActivityIndicator color="#fff" />
                                        <Text style={styles.submitText}>Processing...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.submitText}>
                                            {activeTab === 'activate' ? 'Activate Plan Now' : 'Confirm Refund'}
                                        </Text>
                                        <Ionicons
                                            name={activeTab === 'activate' ? 'flash' : 'refresh-circle'}
                                            size={20}
                                            color="#fff"
                                        />
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
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    activateIcon: {
        backgroundColor: colors.primary.start + '20',
    },
    refundIcon: {
        backgroundColor: '#ef444420',
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
    modalSubtitleBold: {
        fontWeight: '600',
        color: colors.text.primary,
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background.secondary,
        borderRadius: BorderRadius.md,
        padding: 4,
        marginBottom: Spacing.lg,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
        gap: 6,
    },
    activeTabTextContainer: {
        backgroundColor: colors.primary.start,
    },
    activeTabRefundTextContainer: {
        backgroundColor: '#ef4444',
    },
    tabText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: colors.text.muted,
    },
    activeTabText: {
        color: '#fff',
    },
    activeTabTextRefund: {
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
    infoBannerRefund: {
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
        borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#ef444420',
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
    refundContainer: {
        minHeight: 150,
    },
    loadingState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 10,
        color: colors.text.muted,
        fontSize: FontSize.sm,
    },
    emptyState: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: colors.background.secondary,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 10,
        color: colors.text.muted,
        fontSize: FontSize.sm,
    },
    investmentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: colors.background.card,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: Spacing.sm,
        ...Shadow.small,
    },
    selectedInvestment: {
        borderColor: colors.primary.start,
        backgroundColor: colors.primary.start + '10',
    },
    invAmount: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    invDate: {
        fontSize: FontSize.xs,
        color: colors.text.muted,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.text.muted,
    },
});
