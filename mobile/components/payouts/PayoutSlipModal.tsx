import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { BorderRadius, FontSize, Shadow, Spacing, ThemeColors } from '../../constants/Theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Payout } from '../../lib/types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

const { height } = Dimensions.get('window');

interface PayoutSlipModalProps {
    visible: boolean;
    onClose: () => void;
    payout: Payout | null;
}

export const PayoutSlipModal: React.FC<PayoutSlipModalProps> = ({ visible, onClose, payout }) => {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!payout) return null;

    const grossAmount = Number(payout.amount);
    const tds = Number(payout.tds || 0);
    const adminCharges = Number(payout.admin_charges || 0);
    const netAmount = Number(payout.net_amount || (grossAmount - tds - adminCharges));

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const logoUrl = 'https://shreesarwadnya.com/sarwadnya-nav-logo.png';
            const issueDate = formatDate(payout.created_at);
            const payoutDate = formatDate(payout.payout_date || payout.created_at);
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Payout Slip #${payout.id}</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #333; }
                        .container { padding: 40px; position: relative; }
                        .watermark { position: absolute; top: 30%; left: 0; right: 0; text-align: center; opacity: 0.03; z-index: -1; transform: rotate(-15deg); }
                        .watermark img { width: 500px; height: 500px; object-fit: contain; }
                        
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
                        .header-left { display: flex; align-items: center; gap: 20px; }
                        .logo { width: 60px; height: 60px; padding: 5px; border: 1px solid #e2e8f0; border-radius: 12px; }
                        .brand h1 { margin: 0; color: #B8860B; font-size: 18px; font-style: italic; text-transform: uppercase; max-width: 250px; line-height: 1.2; }
                        .brand p { margin: 5px 0 0; font-size: 10px; font-weight: bold; color: #64748b; letter-spacing: 2px; text-transform: uppercase; }
                        
                        .header-right { text-align: right; font-size: 11px; line-height: 1.6; color: #475569; max-width: 250px; }
                        
                        .slip-type { text-align: center; margin: 30px 0; }
                        .slip-type span { background: #0f172a; color: white; padding: 8px 30px; border-radius: 30px; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
                        
                        .grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 30px; }
                        .grid-col { border-right: 1px solid #e2e8f0; }
                        .grid-col:last-child { border-right: none; }
                        .col-header { background: #f8fafc; padding: 10px 15px; border-bottom: 1px solid #e2e8f0; font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
                        .col-body { padding: 15px; }
                        .row { display: flex; flex-direction: column; margin-bottom: 15px; }
                        .row.align-right { align-items: flex-end; }
                        .row-label { font-size: 9px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 3px; }
                        .row-val { font-size: 13px; font-weight: bold; color: #1e293b; }

                        .calc { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 30px; }
                        .calc-header { background: #0f172a; padding: 12px 15px; display: flex; justify-content: space-between; color: white; font-size: 11px; font-weight: bold; text-transform: uppercase; }
                        .calc-header span.curr { color: #f59e0b; font-size: 9px; }
                        
                        .calc-grid { display: grid; grid-template-columns: 1fr 1fr; background: white; }
                        .calc-col { border-right: 1px solid #e2e8f0; }
                        .calc-col:last-child { border-right: none; }
                        .c-header { background: #f8fafc; padding: 8px 15px; display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0; }
                        .amt-row { display: flex; justify-content: space-between; padding: 10px 15px; font-size: 11px; color: #475569; }
                        .amt-row strong { color: #1e293b; }
                        .amt-row.red strong { color: #dc2626; }
                        .calc-total { display: flex; justify-content: space-between; padding: 12px 15px; background: #f1f5f9; font-size: 12px; font-weight: bold; color: #0f172a; text-transform: uppercase; }
                        .calc-total.red { color: #dc2626; }

                        .net-box { background: #B8860B; border-radius: 12px; padding: 30px; text-align: center; color: white; margin-bottom: 40px; }
                        .net-label { font-size: 12px; font-weight: bold; letter-spacing: 4px; opacity: 0.9; text-transform: uppercase; }
                        .net-amt { font-size: 40px; font-weight: bold; font-style: italic; margin: 10px 0; }
                        .net-badge { display: inline-block; padding: 5px 20px; border: 1px solid rgba(255,255,255,0.4); border-radius: 20px; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }

                        .footer { margin-top: 40px; padding-top: 30px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; }
                        .auth-box { text-align: center; }
                        .auth-line { width: 150px; border-bottom: 1px solid #0f172a; font-family: 'Times New Roman', Times, serif; font-size: 11px; font-style: italic; color: #94a3b8; padding-bottom: 5px; margin-bottom: 5px; }
                        .auth-label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; }
                        .note { font-size: 10px; font-style: italic; color: #94a3b8; text-align: right; max-width: 300px; line-height: 1.5; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="watermark">
                            <img src="${logoUrl}" alt="" />
                        </div>
                        
                        <div class="header">
                            <div class="header-left">
                                <img src="${logoUrl}" class="logo" />
                                <div class="brand">
                                    <h1>Shree Sarwadnya All in one Solutions</h1>
                                    <p>Grow With Success</p>
                                </div>
                            </div>
                            <div class="header-right">
                                +91 9172956383 | info@sarwadnyafinance.com<br>
                                www.sarwadnyafinance.com
                            </div>
                        </div>

                        <div class="slip-type">
                            <span>${payout.type === 'roi' ? 'Self Bonus Payslip' : 'Level Bonus Payslip'}</span>
                        </div>

                        <div class="grid">
                            <div class="grid-col">
                                <div class="col-header">Member Details</div>
                                <div class="col-body">
                                    <div class="row">
                                        <div class="row-label">Name</div>
                                        <div class="row-val">${user?.name || payout.user?.name || '---'}</div>
                                    </div>
                                    <div class="row">
                                        <div class="row-label">User Name</div>
                                        <div class="row-val">ID: ${user?.id || payout.user?.id || '---'}</div>
                                    </div>
                                    <div class="row">
                                        <div class="row-label">Phone No.</div>
                                        <div class="row-val">${user?.phone_number || payout.user?.phone_number || '---'}</div>
                                    </div>
                                    <div class="row">
                                        <div class="row-label">Email</div>
                                        <div class="row-val">${user?.email || payout.user?.email || '---'}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="grid-col">
                                <div class="col-header" style="text-align: right;">Payment Details</div>
                                <div class="col-body">
                                    <div class="row align-right">
                                        <div class="row-label">Payout No.</div>
                                        <div class="row-val">#${payout.id}</div>
                                    </div>
                                    <div class="row align-right">
                                        <div class="row-label">Issued On</div>
                                        <div class="row-val">${issueDate}</div>
                                    </div>
                                    <div class="row align-right">
                                        <div class="row-label">Payout Date</div>
                                        <div class="row-val">${payoutDate}</div>
                                    </div>
                                    <div class="row align-right">
                                        <div class="row-label">Status</div>
                                        <div class="row-val">${payout.status || 'Paid'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="calc">
                            <div class="calc-header">
                                <span>Bonus Calculation Details</span>
                                <span class="curr">ALL AMOUNTS IN INR (₹)</span>
                            </div>
                            <div class="calc-grid">
                                <div class="calc-col">
                                    <div class="c-header">
                                        <span>Earning Head</span>
                                        <span>Points/Amt</span>
                                    </div>
                                    <div class="amt-row">
                                        <span>${payout.type === 'roi' ? 'Principal Earnings' : 'Level Income'}</span>
                                        <strong>₹${grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                    </div>
                                    <div class="calc-total">
                                        <span>Total Earning</span>
                                        <span>₹${grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                                <div class="calc-col">
                                    <div class="c-header">
                                        <span>Deductions</span>
                                        <span>Points/Amt</span>
                                    </div>
                                    <div class="amt-row red">
                                        <span>TDS Deduction (5%)</span>
                                        <strong>₹${tds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                    </div>
                                    <div class="amt-row red">
                                        <span>Admin Charges</span>
                                        <strong>₹${adminCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                    </div>
                                    <div class="calc-total red">
                                        <span style="color: black;">Total Deduction</span>
                                        <span>₹${(tds + adminCharges).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="net-box">
                            <div class="net-label">Net Amount Payable</div>
                            <div class="net-amt">₹${netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                            <div class="net-badge">Final Settlement Amount</div>
                        </div>

                        <div class="footer">
                            <div class="auth-box">
                                <div class="auth-line">Verified Digital Document</div>
                                <div class="auth-label">Authorized Officer</div>
                            </div>
                            <div class="note">
                                Note: This is an automatically generated system document. No physical signature is required for verification. Generated via Shree Sarwadnya All in one Solutions ERP.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html, base64: false });

            if (Platform.OS === 'android') {
                await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Download Payout Slip' });
            } else {
                await Sharing.shareAsync(uri);
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to generate PDF slip.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header Controls */}
                    <View style={styles.controlBar}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="document-text" size={18} color={colors.text.primary} style={{ marginRight: 6 }} />
                            <Text style={styles.controlTitle}>Payout Slip</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <TouchableOpacity onPress={handleDownload} disabled={isDownloading} style={styles.actionButton}>
                                {isDownloading ? (
                                    <ActivityIndicator size="small" color={colors.primary.start} />
                                ) : (
                                    <Ionicons name="download-outline" size={20} color={colors.primary.start} />
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={20} color={colors.text.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
                        {/* Slip Wrapper */}
                        <View style={styles.slipWrapper}>
                            {/* Watermark overlay (simplified via absolute view) */}
                            <View style={styles.watermarkContainer}>
                                <Ionicons name="diamond" size={150} color={colors.primary.start} style={styles.watermarkIcon} />
                            </View>

                            {/* Slip Header */}
                            <View style={styles.slipHeader}>
                                <View style={styles.brandSection}>
                                    <View style={styles.logoBox}>
                                        <Ionicons name="leaf" size={28} color="#B8860B" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.brandTitle} numberOfLines={2}>Shree Sarwadnya All in one Solutions</Text>
                                        <Text style={styles.brandSubtitle}>GROW WITH SUCCESS</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Slip Type */}
                            <View style={styles.typeContainer}>
                                <View style={styles.typeBadge}>
                                    <Text style={styles.typeText}>
                                        {payout.type === 'roi' ? 'SELF BONUS PAYSLIP' : 'LEVEL BONUS PAYSLIP'}
                                    </Text>
                                </View>
                            </View>

                            {/* Details Grid */}
                            <View style={styles.detailsGrid}>
                                <View style={styles.detailBox}>
                                    <View style={styles.detailBoxHeader}>
                                        <Text style={styles.detailBoxTitle}>MEMBER DETAILS</Text>
                                    </View>
                                    <View style={styles.detailContent}>
                                        <DetailRow label="Name" value={user?.name || payout.user?.name || '---'} />
                                        <DetailRow label="User ID" value={`ID: ${user?.id || payout.user?.id || '---'}`} />
                                        <DetailRow label="Phone No." value={user?.phone_number || payout.user?.phone_number || '---'} />
                                    </View>
                                </View>
                                <View style={styles.detailBox}>
                                    <View style={styles.detailBoxHeader}>
                                        <Text style={[styles.detailBoxTitle, { textAlign: 'right' }]}>PAYMENT DETAILS</Text>
                                    </View>
                                    <View style={styles.detailContent}>
                                        <DetailRow label="Payout No." value={`#${payout.id}`} align="right" />
                                        <DetailRow label="Issued On" value={formatDate(payout.created_at)} align="right" />
                                        <DetailRow label="Status" value={payout.status || 'Paid'} align="right" />
                                    </View>
                                </View>
                            </View>

                            {/* Financial Summary */}
                            <View style={styles.financialContainer}>
                                <View style={styles.financeHeader}>
                                    <Text style={styles.financeTitle}>BONUS CALCULATION</Text>
                                    <Text style={styles.financeCurrency}>INR (₹)</Text>
                                </View>
                                <View style={styles.financeGrid}>
                                    {/* Earnings */}
                                    <View style={styles.financeColumn}>
                                        <View style={styles.financeColHeader}>
                                            <Text style={styles.financeColTitle}>EARNING HEAD</Text>
                                            <Text style={styles.financeColAmount}>AMT</Text>
                                        </View>
                                        <AmountRow label={payout.type === 'roi' ? 'Principal Earnings' : 'Level Income'} amount={grossAmount} />
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalRowTitle}>TOTAL EARNING</Text>
                                            <Text style={styles.totalRowAmount}>{formatCurrency(grossAmount)}</Text>
                                        </View>
                                    </View>
                                    {/* Deductions */}
                                    <View style={[styles.financeColumn, { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                                        <View style={styles.financeColHeader}>
                                            <Text style={styles.financeColTitle}>DEDUCTIONS</Text>
                                            <Text style={styles.financeColAmount}>AMT</Text>
                                        </View>
                                        <AmountRow label="TDS (5%)" amount={tds} isDeduction />
                                        <AmountRow label="Admin (5%)" amount={adminCharges} isDeduction />
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalRowTitle}>TOTAL DEDUCT</Text>
                                            <Text style={[styles.totalRowAmount, { color: colors.status.error }]}>
                                                {formatCurrency(tds + adminCharges)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Net Amount */}
                            <View style={styles.netAmountContainer}>
                                <Text style={styles.netAmountSubtitle}>NET AMOUNT PAYABLE</Text>
                                <Text style={styles.netAmountText}>{formatCurrency(netAmount)}</Text>
                                <View style={styles.netAmountBadge}>
                                    <Text style={styles.netAmountBadgeText}>FINAL SETTLEMENT AMOUNT</Text>
                                </View>
                            </View>

                            {/* Footer */}
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>
                                    Note: This is an automatically generated system document. No physical signature is required for verification.
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// Sub-components
const DetailRow = ({ label, value, align = 'left' }: { label: string, value: string, align?: 'left' | 'right' }) => {
    const { colors } = useTheme();
    return (
        <View style={{ alignItems: align === 'right' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
            <Text style={{ fontSize: 9, fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', marginBottom: 2 }}>{label}</Text>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text.primary }}>{value}</Text>
        </View>
    );
};

const AmountRow = ({ label, amount, isDeduction }: { label: string, amount: number, isDeduction?: boolean }) => {
    const { colors } = useTheme();
    return (
        <View style={stylesRow.container}>
            <Text style={{ fontSize: 11, color: colors.text.secondary }}>{label}</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: isDeduction && amount > 0 ? colors.status.error : colors.text.primary }}>
                {formatCurrency(amount)}
            </Text>
        </View>
    );
};
const stylesRow = StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, }
});

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        paddingVertical: Spacing.xl,
    },
    container: {
        backgroundColor: colors.background.primary,
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        maxHeight: height * 0.85,
    },
    controlBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: colors.background.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    controlTitle: {
        fontSize: FontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    closeButton: {
        padding: Spacing.xs,
        backgroundColor: colors.background.primary,
        borderRadius: BorderRadius.sm,
    },
    actionButton: {
        padding: Spacing.xs,
        backgroundColor: isDark ? 'rgba(242,159,5,0.1)' : 'rgba(242,159,5,0.1)',
        borderRadius: BorderRadius.sm,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    slipWrapper: {
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        position: 'relative',
        ...Shadow.medium,
        overflow: 'hidden',
    },
    watermarkContainer: {
        position: 'absolute',
        top: '30%',
        left: '20%',
        opacity: 0.03,
        transform: [{ rotate: '15deg' }],
        zIndex: 0,
    },
    watermarkIcon: {
        alignSelf: 'center',
    },
    slipHeader: {
        borderBottomWidth: 2,
        borderBottomColor: colors.border,
        paddingBottom: Spacing.md,
        marginBottom: Spacing.md,
        zIndex: 1,
    },
    brandSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBox: {
        width: 50,
        height: 50,
        backgroundColor: isDark ? '#222' : '#fff',
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        ...Shadow.small,
        borderWidth: 1,
        borderColor: colors.border,
    },
    brandTitle: {
        fontSize: FontSize.md,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#B8860B',
        textTransform: 'uppercase',
    },
    brandSubtitle: {
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 2,
        color: colors.text.muted,
        marginTop: 2,
    },
    typeContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
        zIndex: 1,
    },
    typeBadge: {
        backgroundColor: isDark ? '#333' : '#111',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        borderRadius: 30,
    },
    typeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    detailsGrid: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xl,
        zIndex: 1,
    },
    detailBox: {
        flex: 1,
    },
    detailBoxHeader: {
        backgroundColor: colors.background.card,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    detailBoxTitle: {
        fontSize: 9,
        fontWeight: '900',
        color: colors.text.secondary,
        letterSpacing: 1,
    },
    detailContent: {
        padding: Spacing.md,
    },
    financialContainer: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xl,
        zIndex: 1,
        overflow: 'hidden',
    },
    financeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: isDark ? '#333' : '#111',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    financeTitle: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    financeCurrency: {
        color: colors.primary.start,
        fontSize: 9,
        fontWeight: 'bold',
    },
    financeGrid: {
        flexDirection: 'row',
    },
    financeColumn: {
        flex: 1,
    },
    financeColHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.background.card,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    financeColTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.text.muted,
    },
    financeColAmount: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.text.muted,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        marginTop: Spacing.sm,
    },
    totalRowTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.text.primary,
    },
    totalRowAmount: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.text.primary,
    },
    netAmountContainer: {
        backgroundColor: '#B8860B',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
        zIndex: 1,
        ...Shadow.medium,
    },
    netAmountSubtitle: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 2,
        marginBottom: Spacing.xs,
    },
    netAmountText: {
        fontSize: 28,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    netAmountBadge: {
        marginTop: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 20,
    },
    netAmountBadgeText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: 1,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        borderStyle: 'dashed',
        paddingTop: Spacing.md,
        zIndex: 1,
    },
    footerText: {
        fontSize: 9,
        color: colors.text.muted,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 14,
    },
});
