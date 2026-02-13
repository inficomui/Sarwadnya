import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
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
import Toast from 'react-native-toast-message';
import { BorderRadius, FontSize, Gradients, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { Transfer } from '../../lib/types';
import { useGetPaymentDetailsQuery } from '../../redux/apies/paymentApi';
import { ImagePreviewModal } from '../common';

const BACKEND_URL = 'https://api.sarwadnyafinance.com';
const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/storage/'}${path}`;
};

interface AssetFormProps {
    walletBalance: number;
    isWalletActive: boolean;
    onSubmit: (formData: any, method: string) => Promise<void>;
    isLoading: boolean;
    history?: Transfer[];
}

export const AssetForm: React.FC<AssetFormProps> = ({
    walletBalance,
    isWalletActive,
    onSubmit,
    isLoading,
    history = []
}) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const [amount, setAmount] = useState('50000');
    const [method, setMethod] = useState<'Wallet' | 'Bank Transfer' | 'Cash' | 'USDT Deposit' | ''>('');
    const [referenceId, setReferenceId] = useState('');
    const [notes, setNotes] = useState('');
    const [receipt, setReceipt] = useState<any>(null);
    const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

    const { data: paymentData, isLoading: isLoadingPayment } = useGetPaymentDetailsQuery(undefined, {
        skip: method !== 'Bank Transfer' && method !== 'USDT Deposit'
    });

    const paymentDetails = paymentData?.data;

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setReceipt(result.assets[0]);
        }
    };

    const copyToClipboard = async (text: string, label: string) => {
        await Clipboard.setStringAsync(text);
        Toast.show({
            type: 'success',
            text1: 'Copied!',
            text2: `${label} copied to clipboard`
        });
    };

    const validate = () => {
        const numAmount = parseFloat(amount);
        const minAmount = method === 'Wallet' ? 10000 : 50000;
        const multiple = method === 'Wallet' ? 1000 : 10000;

        if (isNaN(numAmount) || numAmount < minAmount) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: `Minimum amount for ${method || 'this method'} is ₹${minAmount.toLocaleString('en-IN')}`
            });
            return false;
        }
        if (numAmount % multiple !== 0) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: `Amount must be in multiples of ₹${multiple.toLocaleString('en-IN')}`
            });
            return false;
        }
        if (!method) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Please select a payment method' });
            return false;
        }
        if (method === 'Wallet') {
            if (!isWalletActive) {
                Toast.show({
                    type: 'error',
                    text1: 'Wallet Not Active',
                    text2: 'Please contact support to activate your investment wallet.'
                });
                return false;
            }
            if (numAmount > walletBalance) {
                Toast.show({ type: 'error', text1: 'Error', text2: 'Insufficient wallet balance' });
                return false;
            }
        }
        if (method === 'Bank Transfer' && !receipt) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Payment proof is required for Bank Transfer' });
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const numAmount = parseFloat(amount);

        if (method === 'Wallet') {
            onSubmit({
                amount: numAmount,
                total_months: 12
            }, 'Wallet');
        } else {
            const formData = new FormData();
            formData.append('amount', amount);
            formData.append('method', method);
            if (referenceId) formData.append('reference_id', referenceId);
            if (notes) formData.append('notes', notes);
            if (receipt) {
                const file = {
                    uri: receipt.uri,
                    name: 'receipt.jpg',
                    type: 'image/jpeg',
                    lastModified: Date.now()
                } as any;
                formData.append('receipt_image', file);
            }
            onSubmit(formData, method);
        }
    };

    return (
        <View style={styles.outerContainer}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.container}>
                    {/* Amount Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Investment Amount (₹)</Text>
                        <View style={[
                            styles.inputWrapper,
                            (isNaN(parseFloat(amount)) ||
                                parseFloat(amount) < (method === 'Wallet' ? 10000 : 50000) ||
                                parseFloat(amount) % (method === 'Wallet' ? 1000 : 10000) !== 0) && styles.inputError
                        ]}>
                            <Text style={styles.currencyPrefix}>₹</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={method === 'Wallet' ? "10000" : "50000"}
                                placeholderTextColor={colors.text.muted}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />
                        </View>
                        <Text style={styles.helperText}>
                            {method === 'Wallet'
                                ? 'Min: ₹10,000. Multiples of 1,000.'
                                : 'Min: ₹50,000. Multiples of 10,000.'}
                        </Text>
                    </View>

                    {/* Payment Method Selector */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Payment Method</Text>
                        <View style={styles.methodGrid}>
                            <TouchableOpacity
                                style={[
                                    styles.methodItem,
                                    method === 'Wallet' && styles.methodActive,
                                    !isWalletActive && styles.methodDisabled
                                ]}
                                onPress={() => {
                                    if (!isWalletActive) {
                                        Toast.show({
                                            type: 'info',
                                            text1: 'Direct Investment Locked',
                                            text2: 'Wallet investment is only available for active investment accounts.'
                                        });
                                        return;
                                    }
                                    setMethod('Wallet');
                                }}
                            >
                                <Ionicons
                                    name={isWalletActive ? "wallet-outline" : "lock-closed-outline"}
                                    size={24}
                                    color={method === 'Wallet' ? colors.primary.start : colors.text.secondary}
                                />
                                <Text style={[styles.methodText, method === 'Wallet' && styles.methodActiveText]}>
                                    {isWalletActive ? 'Wallet' : 'Inactive'}
                                </Text>
                                <Text style={styles.methodBalance}>₹{walletBalance.toLocaleString('en-IN')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.methodItem, method === 'Bank Transfer' && styles.methodActive]}
                                onPress={() => setMethod('Bank Transfer')}
                            >
                                <Ionicons name="business-outline" size={24} color={method === 'Bank Transfer' ? colors.primary.start : colors.text.secondary} />
                                <Text style={[styles.methodText, method === 'Bank Transfer' && styles.methodActiveText]}>Bank</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.methodItem, method === 'Cash' && styles.methodActive]}
                                onPress={() => setMethod('Cash')}
                            >
                                <Ionicons name="cash-outline" size={24} color={method === 'Cash' ? colors.primary.start : colors.text.secondary} />
                                <Text style={[styles.methodText, method === 'Cash' && styles.methodActiveText]}>Cash</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.methodItem, method === 'USDT Deposit' && styles.methodActive]}
                                onPress={() => setMethod('USDT Deposit')}
                            >
                                <Ionicons name="logo-bitcoin" size={24} color={method === 'USDT Deposit' ? colors.primary.start : colors.text.secondary} />
                                <Text style={[styles.methodText, method === 'USDT Deposit' && styles.methodActiveText]}>USDT</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Payment Details View */}
                    {(method === 'Bank Transfer' || method === 'USDT Deposit') && (
                        <View style={styles.detailsContainer}>
                            <View style={styles.detailsCard}>
                                {isLoadingPayment ? (
                                    <View style={{ padding: 20 }}>
                                        <ActivityIndicator color={colors.primary.start} />
                                    </View>
                                ) : paymentDetails ? (
                                    method === 'Bank Transfer' ? (
                                        <View>
                                            <Text style={styles.detailsTitle}>Bank Transfer Details</Text>
                                            <DetailItem label="Bank Name" value={paymentDetails.bank_name} colors={colors} styles={styles} />
                                            <DetailItem label="Account Holder" value={paymentDetails.account_holder_name} colors={colors} styles={styles} />
                                            <DetailItem label="Account No" value={paymentDetails.account_number} canCopy onCopy={() => copyToClipboard(paymentDetails.account_number, "Account Number")} colors={colors} styles={styles} />
                                            <DetailItem label="IFSC Code" value={paymentDetails.ifsc_code} canCopy onCopy={() => copyToClipboard(paymentDetails.ifsc_code, "IFSC Code")} colors={colors} styles={styles} />
                                        </View>
                                    ) : (
                                        <View>
                                            <Text style={styles.detailsTitle}>USDT Deposit Details</Text>
                                            <DetailItem label="Network" value={paymentDetails.usdt_network} colors={colors} styles={styles} />
                                            <DetailItem label="Wallet Address" value={paymentDetails.usdt_address} canCopy onCopy={() => copyToClipboard(paymentDetails.usdt_address, "Wallet Address")} colors={colors} styles={styles} />
                                            {(paymentDetails.qr_code || paymentDetails.receipt_image) && (
                                                <View style={styles.qrContainer}>
                                                    <Text style={styles.qrLabel}>SCAN QR CODE</Text>
                                                    <TouchableOpacity
                                                        activeOpacity={0.8}
                                                        onPress={() => setPreviewImage({
                                                            url: getFullUrl(paymentDetails.qr_code || paymentDetails.receipt_image || ""),
                                                            title: 'USDT Payment QR'
                                                        })}
                                                        style={styles.qrWrapper}
                                                    >
                                                        <Image
                                                            source={{ uri: getFullUrl(paymentDetails.qr_code || paymentDetails.receipt_image || "") }}
                                                            style={styles.qrImage}
                                                            resizeMode="contain"
                                                        />
                                                        <View style={styles.qrOverlay}>
                                                            <Ionicons name="expand-outline" size={24} color="#fff" />
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            <View style={styles.warningBox}>
                                                <Ionicons name="warning-outline" size={16} color="#b45309" />
                                                <Text style={styles.warningText}>Only send USDT ({paymentDetails.usdt_network}) to this address.</Text>
                                            </View>
                                        </View>
                                    )
                                ) : (
                                    <Text style={styles.errorText}>No payment details available.</Text>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Transaction ID & Receipt */}
                    {method !== 'Wallet' && method !== '' && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Transaction / Reference ID</Text>
                                <TextInput
                                    style={styles.subInput}
                                    placeholder="e.g. UPI Ref, Bank Txn ID"
                                    placeholderTextColor={colors.text.muted}
                                    value={referenceId}
                                    onChangeText={setReferenceId}
                                />
                            </View>

                            {method !== 'Cash' && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        Payment Proof {method === 'Bank Transfer' ? <Text style={{ color: colors.status.error }}>*</Text> : '(Optional)'}
                                    </Text>
                                    <View style={styles.uploadButton}>
                                        {receipt ? (
                                            <View style={styles.receiptPreview}>
                                                <TouchableOpacity
                                                    onPress={() => setPreviewImage({ url: receipt.uri, title: 'Payment Proof Preview' })}
                                                    activeOpacity={0.7}
                                                >
                                                    <Image source={{ uri: receipt.uri }} style={styles.previewImage} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={pickImage} style={styles.changeProofButton} activeOpacity={0.7}>
                                                    <Text style={styles.uploadText}>Change Proof</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.fullWidthCenter}
                                                onPress={pickImage}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons name="camera-outline" size={24} color={colors.text.muted} />
                                                <Text style={styles.uploadText}>Upload Payment Slip</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Notes (Optional)</Text>
                                <TextInput
                                    style={[styles.subInput, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                                    placeholder="Add any additional details..."
                                    placeholderTextColor={colors.text.muted}
                                    multiline
                                    value={notes}
                                    onChangeText={setNotes}
                                />
                            </View>
                        </>
                    )}

                    <View style={{ height: 20 }} />
                </View>
            </ScrollView>

            {/* Fixed Submit Button Area */}
            <View style={styles.submitContainer}>
                <TouchableOpacity
                    style={[styles.submitButton, (isLoading || !method) && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={isLoading || !method}
                >
                    <LinearGradient
                        colors={Gradients.primary as [string, string, ...string[]]}
                        style={styles.submitGradient}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.submitText}>
                                    {method === 'Wallet' ? 'Invest from Wallet' : 'Submit Investment'}
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            <ImagePreviewModal
                visible={!!previewImage}
                imageUrl={previewImage?.url || ''}
                title={previewImage?.title || ''}
                onClose={() => setPreviewImage(null)}
            />
        </View>
    );
};

const DetailItem = ({ label, value, canCopy, onCopy, colors, styles }: any) => (
    <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={[styles.detailValue, { color: colors.text.primary }]}>{value}</Text>
        </View>
        {canCopy && (
            <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
                <Ionicons name="copy-outline" size={18} color={colors.primary.start} />
            </TouchableOpacity>
        )}
    </View>
);

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    outerContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
        paddingBottom: 100,
    },
    container: {
        backgroundColor: colors.background.card,
        borderRadius: BorderRadius.xxl,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadow.medium,
    },
    inputGroup: {
        marginBottom: Spacing.xl,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: Spacing.lg,
    },
    inputError: {
        borderColor: colors.status.error,
    },
    currencyPrefix: {
        fontSize: FontSize.lg,
        fontWeight: 'bold',
        color: colors.text.muted,
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        height: 56,
        fontSize: FontSize.xl,
        color: colors.text.primary,
        fontWeight: 'bold',
    },
    helperText: {
        fontSize: 10,
        color: colors.text.muted,
        marginTop: 6,
    },
    methodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: Spacing.md,
    },
    methodItem: {
        width: '48%',
        height: 85,
        padding: Spacing.sm,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    methodDisabled: {
        opacity: 0.5,
        backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : '#f1f5f9',
    },
    methodActive: {
        borderColor: colors.primary.start,
        backgroundColor: colors.primary.start + '08',
    },
    methodText: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
        color: colors.text.secondary,
    },
    methodActiveText: {
        color: colors.primary.start,
    },
    methodBalance: {
        fontSize: 9,
        color: colors.status.success,
        fontWeight: '700',
    },
    detailsContainer: {
        marginTop: Spacing.md,
        width: '100%',
    },
    detailsCard: {
        backgroundColor: colors.background.primary,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.primary.start + '20',
        borderStyle: 'dashed',
    },
    detailsTitle: {
        fontSize: FontSize.xs,
        fontWeight: 'bold',
        color: colors.primary.start,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        paddingBottom: Spacing.xs,
        borderBottomWidth: 1,
    },
    detailLabel: {
        fontSize: 10,
        color: colors.text.muted,
    },
    detailValue: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
    },
    copyButton: {
        padding: 4,
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: isDark ? 'rgba(180, 83, 9, 0.1)' : '#fffbeb',
        padding: 8,
        borderRadius: 8,
        marginTop: 8,
        gap: 6,
    },
    warningText: {
        flex: 1,
        fontSize: 10,
        color: '#b45309',
        fontWeight: '500',
    },
    subInput: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: Spacing.md,
        height: 48,
        fontSize: FontSize.sm,
        color: colors.text.primary,
    },
    uploadButton: {
        height: 100,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    uploadText: {
        marginTop: 6,
        fontSize: 12,
        color: colors.text.muted,
        fontWeight: '500',
    },
    receiptPreview: {
        alignItems: 'center',
    },
    previewImage: {
        width: 100,
        height: 60,
        borderRadius: 4,
        marginBottom: 4,
    },
    changeProofButton: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 4,
    },
    submitContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background.card,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    fullWidthCenter: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadow.medium,
    },
    disabledButton: {
        opacity: 0.6,
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
        fontSize: FontSize.lg,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: FontSize.xs,
        color: colors.status.error,
        textAlign: 'center',
    },
    qrContainer: {
        alignItems: 'center',
        marginVertical: Spacing.md,
        padding: Spacing.md,
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    qrLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.text.muted,
        marginBottom: Spacing.sm,
        letterSpacing: 1,
    },
    qrWrapper: {
        width: 140,
        height: 140,
        backgroundColor: '#fff',
        borderRadius: BorderRadius.md,
        padding: Spacing.xs,
        overflow: 'hidden',
        position: 'relative',
        ...Shadow.small,
    },
    qrImage: {
        width: '100%',
        height: '100%',
    },
    qrOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.6,
    }
});
